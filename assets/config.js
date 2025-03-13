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
    clearUrls: false
};

firebaseConfig = null;

onLoad = function () {
    console.log('SIGame successfully loaded');
};
