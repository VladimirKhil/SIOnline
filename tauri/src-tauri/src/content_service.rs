//! SIContentService client for uploading packages directly from Rust.
//!
//! This module provides functionality to:
//! - Check if a package already exists in the content service
//! - Upload packages with progress reporting
//! - Calculate SHA-1 hashes for package integrity

use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64_STANDARD};
use sha1::{Digest, Sha1};
use percent_encoding::{utf8_percent_encode, NON_ALPHANUMERIC};
use reqwest::{
    multipart::{Form, Part},
    Client, StatusCode, Body,
};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::{Arc, atomic::{AtomicU64, Ordering}};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use futures::stream::{self, StreamExt};

/// File key used to identify a package in the content service
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileKey {
    pub name: String,
    pub hash: String, // Base64-encoded SHA-1 hash
}

/// Result of an upload operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadResult {
    pub uri: String,
    pub already_existed: bool,
}

/// Error types for content service operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContentServiceError {
    IoError(String),
    NetworkError(String),
    HashError(String),
    UploadFailed(String, u16),
    PackageNotFound,
}

impl std::fmt::Display for ContentServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ContentServiceError::IoError(msg) => write!(f, "IO error: {}", msg),
            ContentServiceError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            ContentServiceError::HashError(msg) => write!(f, "Hash error: {}", msg),
            ContentServiceError::UploadFailed(msg, status) => {
                write!(f, "Upload failed ({}): {}", status, msg)
            }
            ContentServiceError::PackageNotFound => write!(f, "Package not found"),
        }
    }
}

/// Escape base64 string for URL usage (replace + with -, / with _, remove = padding)
fn escape_base64(input: &str) -> String {
    input.replace('+', "-").replace('/', "_").replace('=', "")
}

/// Calculate SHA-1 hash of file data and return as base64 string
pub fn calculate_sha1_base64(data: &[u8]) -> String {
    let mut hasher = Sha1::new();
    hasher.update(data);
    let result = hasher.finalize();
    BASE64_STANDARD.encode(result)
}

/// SIContentService client
pub struct SIContentServiceClient {
    client: Client,
    service_uri: String,
}

impl SIContentServiceClient {
    /// Create a new content service client
    pub fn new(service_uri: &str) -> Self {
        Self {
            client: Client::new(),
            service_uri: service_uri.trim_end_matches('/').to_string(),
        }
    }

    /// Try to get the URI of an existing package
    /// Returns None if the package doesn't exist (404), or the URI if it does
    pub async fn try_get_package_uri(
        &self,
        package_key: &FileKey,
    ) -> Result<Option<String>, ContentServiceError> {
        let escaped_hash = escape_base64(&package_key.hash);
        let encoded_name = utf8_percent_encode(&package_key.name, NON_ALPHANUMERIC).to_string();

        let url = format!(
            "{}/api/v1/content/packages/{}/{}",
            self.service_uri, escaped_hash, encoded_name
        );

        log::info!("Checking if package exists at: {}", url);

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| ContentServiceError::NetworkError(e.to_string()))?;

        match response.status() {
            StatusCode::OK => {
                let uri = response
                    .text()
                    .await
                    .map_err(|e| ContentServiceError::NetworkError(e.to_string()))?;
                log::info!("Package already exists at: {}", uri);
                Ok(Some(uri))
            }
            StatusCode::NOT_FOUND => {
                log::info!("Package does not exist, upload required");
                Ok(None)
            }
            status => {
                let error_text = response.text().await.unwrap_or_default();
                Err(ContentServiceError::UploadFailed(error_text, status.as_u16()))
            }
        }
    }

    /// Upload a package to the content service
    /// Returns the URI of the uploaded package
    pub async fn upload_package<F>(
        &self,
        package_key: &FileKey,
        file_data: Vec<u8>,
        on_progress: F,
    ) -> Result<String, ContentServiceError>
    where
        F: Fn(u64, u64) + Send + Sync + 'static,
    {
        let url = format!("{}/api/v1/content/packages", self.service_uri);

        log::info!(
            "Uploading package to {} (size: {} bytes)",
            url,
            file_data.len()
        );

        let total_size = file_data.len() as u64;
        let on_progress = Arc::new(on_progress);

        // Report initial progress
        on_progress(0, total_size);

        // Create a streaming body with progress tracking
        // Split data into chunks and report progress as each chunk is consumed
        const CHUNK_SIZE: usize = 64 * 1024; // 64KB chunks
        let chunks: Vec<Vec<u8>> = file_data
            .chunks(CHUNK_SIZE)
            .map(|chunk| chunk.to_vec())
            .collect();

        let uploaded = Arc::new(AtomicU64::new(0));
        let uploaded_clone = uploaded.clone();
        let on_progress_clone = on_progress.clone();

        let stream = stream::iter(chunks).map(move |chunk| {
            let chunk_len = chunk.len() as u64;
            let prev = uploaded_clone.fetch_add(chunk_len, Ordering::SeqCst);
            let current = prev + chunk_len;
            on_progress_clone(current, total_size);
            Ok::<_, std::io::Error>(chunk)
        });

        let body = Body::wrap_stream(stream);

        // Build multipart form with streaming body
        let part = Part::stream_with_length(body, total_size)
            .file_name(package_key.name.clone())
            .mime_str("application/x-zip-compressed")
            .map_err(|e| ContentServiceError::IoError(e.to_string()))?;

        let form = Form::new().part("file", part);

        // Use the SHA-1 hash directly in the Content-MD5 header (the header name is historical,
        // but the server expects SHA-1 hash as base64)
        let response = self
            .client
            .post(&url)
            .header("Content-MD5", &package_key.hash)
            .multipart(form)
            .send()
            .await
            .map_err(|e| ContentServiceError::NetworkError(e.to_string()))?;

        // Ensure we report 100% at the end
        on_progress(total_size, total_size);

        if response.status().is_success() {
            let uri = response
                .text()
                .await
                .map_err(|e| ContentServiceError::NetworkError(e.to_string()))?;
            log::info!("Package uploaded successfully: {}", uri);
            Ok(uri)
        } else {
            let status = response.status().as_u16();
            let error_text = response.text().await.unwrap_or_default();
            log::error!("Upload failed with status {}: {}", status, error_text);
            Err(ContentServiceError::UploadFailed(error_text, status))
        }
    }

    /// Upload a package if it doesn't already exist
    /// Returns the URI and whether it already existed
    pub async fn upload_package_if_not_exists<F>(
        &self,
        package_key: &FileKey,
        file_data: Vec<u8>,
        on_progress: F,
    ) -> Result<UploadResult, ContentServiceError>
    where
        F: Fn(u64, u64) + Send + Sync + 'static,
    {
        // First check if package already exists
        if let Some(uri) = self.try_get_package_uri(package_key).await? {
            return Ok(UploadResult {
                uri,
                already_existed: true,
            });
        }

        // Package doesn't exist, upload it
        let uri = self.upload_package(package_key, file_data, on_progress).await?;
        Ok(UploadResult {
            uri,
            already_existed: false,
        })
    }
}

/// Read file from path and calculate its MD5 hash
pub async fn read_file_with_hash(path: &Path) -> Result<(Vec<u8>, String), ContentServiceError> {
    let mut file = File::open(path)
        .await
        .map_err(|e| ContentServiceError::IoError(e.to_string()))?;

    let mut data = Vec::new();
    file.read_to_end(&mut data)
        .await
        .map_err(|e| ContentServiceError::IoError(e.to_string()))?;

    let hash = calculate_sha1_base64(&data);
    Ok((data, hash))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_base64() {
        assert_eq!(escape_base64("abc+def/ghi"), "abc-def_ghi");
        assert_eq!(escape_base64("normal"), "normal");
        assert_eq!(escape_base64("hash=="), "hash");
        assert_eq!(escape_base64("COjkNaaXOVDBWzFXLKT5l7rLF7Q="), "COjkNaaXOVDBWzFXLKT5l7rLF7Q");
    }

    #[test]
    fn test_calculate_sha1_base64() {
        let data = b"test data";
        let hash = calculate_sha1_base64(data);
        // SHA-1 of "test data" should produce a consistent base64 hash
        assert!(!hash.is_empty());
    }
}
