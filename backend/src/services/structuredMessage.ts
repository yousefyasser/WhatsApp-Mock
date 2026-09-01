export type LocationPayload = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

export type InteractiveType = 'location_request_message' | 'request_contact_info';

export type InteractivePayload = {
  type: InteractiveType;
  body: { text: string };
  action: { name: string };
};

export type ContactShare = {
  origin?: 'contact_request' | 'other';
  name?: { formatted_name?: string; first_name?: string };
  phones?: { phone: string; wa_id?: string; type?: string }[];
};

const INTERACTIVE_DEFAULT_ACTION: Record<InteractiveType, string> = {
  location_request_message: 'send_location',
  request_contact_info: 'request_contact_info'
};

export const isLocationPayload = (value: LocationPayload | { error: string }): value is LocationPayload =>
  !('error' in value);

export const parseLocationPayload = (location: any): LocationPayload | { error: string } => {
  const lat = Number(location?.latitude);
  const lng = Number(location?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: 'location.latitude and location.longitude are required' };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: 'location coordinates are out of range' };
  }
  const payload: LocationPayload = { latitude: lat, longitude: lng };
  if (location.name) payload.name = String(location.name);
  if (location.address) payload.address = String(location.address);
  return payload;
};

export const parseInteractivePayload = (interactive: any): { payload: InteractivePayload; bodyText: string } | { error: string } => {
  const type = interactive?.type as InteractiveType;
  if (type !== 'location_request_message' && type !== 'request_contact_info') {
    return { error: `Unsupported interactive type: ${interactive?.type || 'unknown'}` };
  }
  const text = interactive?.body?.text;
  if (!text || typeof text !== 'string') {
    return { error: 'interactive.body.text is required' };
  }
  if (text.length > 1024) {
    return { error: 'interactive.body.text exceeds 1024 characters' };
  }
  return {
    payload: {
      type,
      body: { text },
      action: { name: interactive?.action?.name || INTERACTIVE_DEFAULT_ACTION[type] }
    },
    bodyText: text
  };
};

export const buildContactShare = (name: string, phoneNumber: string, origin: 'contact_request' | 'other' = 'contact_request'): ContactShare[] => {
  const digits = phoneNumber.replace(/\D/g, '');
  return [{
    origin,
    name: { formatted_name: name || phoneNumber },
    phones: [{
      phone: phoneNumber.startsWith('+') ? phoneNumber : `+${digits || phoneNumber}`,
      wa_id: digits || phoneNumber,
      type: 'CELL'
    }]
  }];
};
