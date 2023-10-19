export default function getDeviceType() {
    const { userAgent } = navigator;

    if (/mobile/i.test(userAgent)) {
        return 'mobile';
    }

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        return 'tablet';
    }

    return 'pc';
}