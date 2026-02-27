const generateAccessAndRefreshToken = (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        if (!accessToken || !refreshToken) {
            throw new Error("Error generating tokens.")
        }
        user.save({validateBeforeSaving: false})
        return {accessToken, refreshToken};
    } catch (error) {
        throw error;
    }
}

export {
    generateAccessAndRefreshToken
}