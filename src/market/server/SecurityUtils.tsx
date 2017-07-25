const crypto = require('crypto');
import { Constants } from './../shared/utils/Constants';

const hashSize = 32;
const encryptionSecretSize = 32;
const encryptionAlgorithm = 'aes-256-cbc';

export function encrypt(text: string) {
    // First encrypt the message. Encrypted text is 
    // prepended with iv
    let cipherTextBuffer = simpleEncrypt(text);
    let hashSecret = process.env.hashSecret || Constants.primaryHashSecret;
    let hashBuffer = getHash(cipherTextBuffer, hashSecret);
    let totalLength = (cipherTextBuffer ? cipherTextBuffer.length : 0) + (hashBuffer ? hashBuffer.length : 0);
    let finalTextBuffer = Buffer.concat([cipherTextBuffer, hashBuffer], totalLength);
    return finalTextBuffer.toString('base64');
}

export function decrypt(text: string) {
    try {
        let cipherBuffer = new Buffer(text, 'base64');
        if (cipherBuffer.length < hashSize) {
            // message is smaller than hash, its invalid
            // check if encrypted with previous encryption algo for compatibility
            throw `Invalid message as it is smaller than hashSize, MessageSize:$(messageSize): hashSize: $(hashSize)`;
        }

        let hashBuffer = new Buffer(hashSize);
        let encryptedMessageBuffer = new Buffer(cipherBuffer.length - hashSize);
        cipherBuffer.copy(encryptedMessageBuffer, 0, 0, encryptedMessageBuffer.length);
        cipherBuffer.copy(hashBuffer, 0, encryptedMessageBuffer.length);
        validateHash(encryptedMessageBuffer, hashBuffer);

        // integrity is fine, decrypt it
        let encryptedMessage = encryptedMessageBuffer.toString('base64');
        let decryptedBuffer = simpleDecrypt(encryptedMessage);
        return decryptedBuffer.toString('utf-8');
    } catch (error) {
        throw 'invalid cipher: ' + error;
    }
}

function simpleEncrypt(text: string) {
    // get random iv
    let iv = crypto.randomBytes(16);
    let keyBuffer = getKeyFromSecret();

    let cipher = crypto.createCipheriv(encryptionAlgorithm, keyBuffer, iv);
    let crypted = cipher.update(text, 'utf8', 'base64');
    crypted += cipher.final('base64');
    let cryptedBuffer = new Buffer(crypted, 'base64');
    // Prepend iv to cipher text
    let finalBuffer = Buffer.concat([iv, cryptedBuffer]);
    return finalBuffer;
}

function simpleDecrypt(text: string) {
    try {
        let keyBuffer = getKeyFromSecret();
        return simpleDecryptHelper(text, keyBuffer);
    } catch (error) {
        // Fallback to the older encryption key.
        let keyBuffer = getSecondaryKeyFromSecret();
        return simpleDecryptHelper(text, keyBuffer);
    }
}

function simpleDecryptHelper(text: string, keyBuffer: Buffer) {
    let cipherWithIvBuffer = new Buffer(text, 'base64');
    // Get iv from message
    let iv = new Buffer(16);
    cipherWithIvBuffer.copy(iv, 0, 0, 16);
    let message = cipherWithIvBuffer.toString('base64', 16);
    try {
        // Get key for decryption
        let decipher = crypto.createDecipheriv(encryptionAlgorithm, keyBuffer, iv);
        let dec = decipher.update(message, 'base64', 'utf8');
        dec += decipher.final('utf-8');
        let decryptedBuffer = new Buffer(dec, 'utf-8');
        return decryptedBuffer;
    } catch (error) {
        throw 'Invalid Cipher: ' + error;
    }
}

function validateHashHelper(encryptedBuffer: Buffer, hashSecret: any, hashFromMessage: Buffer) {
    if (hashSecret.length < encryptionSecretSize) {
        return Promise.reject('Hash secret should be at least 32 chars long');
    }

    let hash = getHash(encryptedBuffer, hashSecret);

    // Compare hash received with hash of message
    if (!hash.equals(hashFromMessage)) {
        throw 'Message integrity check failed';
    }
}

function getHash(encryptedBuffer: Buffer, hashSecret: any) {
    // Generate hash of message
    const hmac = crypto.createHmac('sha256', hashSecret);
    hmac.update(encryptedBuffer);
    let hash = hmac.digest();
    return hash;
}

function validateHash(encryptedBuffer: Buffer, computedHash: Buffer) {
    try {
        let hashSecret = process.env.hashSecret || Constants.primaryHashSecret;
        validateHashHelper(encryptedBuffer, hashSecret, computedHash);
    } catch (error) {
        // try the fallback hash function
        let hashSecret = process.env.secondaryHashSecret || Constants.secondaryHashSecret;
        validateHashHelper(encryptedBuffer, hashSecret, computedHash);
    }
}

function getKeyFromSecret() {
    let secretBuffer = new Buffer(process.env.encryptionSecret || Constants.primaryEncryptionSecret, 'utf-8');
    return getKeyFromSecretHelper(secretBuffer);
}

function getSecondaryKeyFromSecret() {
    let secretBuffer = new Buffer(process.env.secondaryEncryptionSecret || Constants.secondaryEncryptionSecret, 'utf-8');
    return getKeyFromSecretHelper(secretBuffer);
}

function getKeyFromSecretHelper(secretBuffer: any) {
    if (secretBuffer.length < 32) {
        throw 'Encryption secret should be at least 32 chars long';
    }

    // If secret is longer than 32 chars, just consume first 32 chars and ignore rest 
    let keyBuffer = new Buffer(encryptionSecretSize);
    secretBuffer.copy(keyBuffer, 0, 0, encryptionSecretSize);
    return keyBuffer;
}