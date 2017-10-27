export const enum Types {
    SelectSession,
    SelectImpression,
    SelectSnapshot,
    SelectView,
    TogglePlayback,
    ToggleSpeed,
    ShowMenu,
    ToggleFullPage,
    NotFound,
    ToggleInactiveSession,
    Error
}

export const selectSession = (session) => {
    return {
        type: Types.SelectSession,
        payload: session
    }
};

export const selectImpression = (impression) => {
    return {
        type: Types.SelectImpression,
        payload: impression
    }
};

export const selectSnapshot = (time) => {
    return {
        type: Types.SelectSnapshot,
        payload: time
    }
};

export const togglePlayback = (isPlaying) => {
    return {
        type: Types.TogglePlayback,
        payload: isPlaying
    }
};

export const toggleSpeed = (isFast) => {
    return {
        type: Types.ToggleSpeed,
        payload: isFast
    }
};

export const selectView = (view) => {
    return {
        type: Types.SelectView,
        payload: view
    }
};

export const showMenu = (menu) => {
    return {
        type: Types.ShowMenu,
        payload: menu
    }
};

export const toggleFullPage = (fullpage) => {
    return {
        type: Types.ToggleFullPage,
        payload: fullpage
    }
};

export const notFound = (flag) => {
    return {
        type: Types.NotFound,
        payload: flag
    }
};

export const error = (msg) => {
    return {
        type: Types.Error,
        payload: msg
    }
};

export const toggleInactiveSession = (flag) => {
    return {
        type: Types.ToggleInactiveSession,
        payload: flag
    }
};
