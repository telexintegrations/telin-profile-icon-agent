export function extractChannelId(payload: any): string | null {
    const settings = payload.settings;

    // Find the setting where label is 'channel_id'
    const channelSetting = settings.find((setting: any) => setting.label === 'channel_id');

    // Return the default value if found, otherwise return null
    return channelSetting ? channelSetting.default : null;
}