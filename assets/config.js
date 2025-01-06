config = {
    serverDiscoveryUri: 'https://vladimirkhil.com/api/si/servers',
    rootUri: '/',
    ads: '<b></b>',
    rewriteUrl: true,
    forceHttps: false,
    registerServiceWorker: false,
    enableNoSleep: false,
    askForConsent: false,
    siStatisticsServiceUri: 'https://vladimirkhil.com/sistatistics',
    appRegistryServiceUri: 'https://vladimirkhil.com/appregistry',
    clearUrls: false,
    siHostsIdUriMap: {
        a: 'https://vladimirkhil.com/sigameserver-0/api/v1',
        b: 'https://content.vladimirkhil.com:8080',
    }
};

firebaseConfig = null;

onLoad = function () {
    console.log('SIGame successfully loaded');
};
