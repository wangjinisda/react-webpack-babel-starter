import * as uuid from 'uuid'

export function generateGuid() {
    return uuid.v4(); // random string, no time sequenced.
}