const emailUsernameFilter = (string) => {
    /**
     * Check if body follows email
     * or username number pattern
     * @returns {{email: string}|{username: string}}
     */
    return /^\S+@\S+$/.test(string)
       ? {
            email: string,
         }
       : {
            userName: string,
         };
};

module.exports = emailUsernameFilter;
