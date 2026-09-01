import { InteractivePayload, LocationPayload, Message, SharedContact } from '../types';

export const parseMessagePayload = <T>(message: Message): T | null => {
  if (!message.payloadJson) return null;
  try {
    return JSON.parse(message.payloadJson) as T;
  } catch {
    return null;
  }
};

export const getLocationPayload = (message: Message): LocationPayload | null =>
  parseMessagePayload<LocationPayload>(message);

export const getInteractivePayload = (message: Message): InteractivePayload | null =>
  parseMessagePayload<InteractivePayload>(message);

export const getSharedContacts = (message: Message): SharedContact[] => {
  const parsed = parseMessagePayload<SharedContact[] | SharedContact>(message);
  if (!parsed) return [];
  return Array.isArray(parsed) ? parsed : [parsed];
};
