const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    return err;
};

const calculateDays = (start_date, end_date) => {
    if (!(start_date instanceof Date)) {
        start_date = new Date(start_date);
    }
    if (!(end_date instanceof Date)) {
        end_date = new Date(end_date);
    }

    const timeDiff = end_date - start_date;
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return days;
};


module.exports = { createError, calculateDays }