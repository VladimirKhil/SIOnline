config = {
    serverDiscoveryUri: 'https://vladimirkhil.com/api/si/servers',
    rootUri: '/',
    ads: '<b>Test ad</b>',
    rewriteUrl: true,
    apiUri: 'https://vladimirkhil.com/api/si',
    forceHttps: false,
    useMessagePackProtocol: false,
    registerServiceWorker: false,
    enableNoSleep: false,
    askForConsent: false,
};

firebaseConfig = null;

onLoad = function () {
    console.log('SIGame Online successfully loaded!');
};
