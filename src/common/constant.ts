export const HTTP_STATUS_CODE = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
};

export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/;

export enum USER_TYPE {
    NORMAL = 'normal',
    GUEST = 'guest',
}

export enum USER_STATUS {
    UNVERIFIED = 'unverified',
    VERIFIED = 'verified',
}

export enum USER_TOKEN_TYPE {
    REFRESH = 'refresh',
    VERIFY_EMAIL = 'verify_email',
    FORGOT_PASSWORD = 'forgot_password',
}

export enum GAME_STATUS {
    WAITNG = 'wating',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

export enum GAME_MODE {
    PVP = 'pvp',
    PVB = 'pvb',
}

export enum GAME_WINNER {
    X_PLAYER = 'xPlayer',
    O_PLAYER = 'oPlayer',
}

export enum MOVE_TYPE {
    X = '0',
    O = '1',
}
