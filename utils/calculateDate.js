const calculateDate = (qty, type) => {
    try {
        const currentDate = new Date();

        // Check the type and modify the date accordingly
        if (type === 'days') {
            currentDate.setDate(currentDate.getDate() + qty);
        } else if (type === 'months') {
            currentDate.setMonth(currentDate.getMonth() + qty);
        } else if (type === 'years') {
            currentDate.setFullYear(currentDate.getFullYear() + qty);
        } else {
            return null; // Invalid type
        }

        // Format the date to 'YYYY-MM-DD HH:MM:SS' format
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
        const day = String(currentDate.getDate()).padStart(2, '0'); // Add leading zero if necessary
        const hour = String(currentDate.getHours()).padStart(2, '0');
        const minute = String(currentDate.getMinutes()).padStart(2, '0');
        const second = String(currentDate.getSeconds()).padStart(2, '0');

        // Return the formatted date as 'YYYY-MM-DD HH:MM:SS'
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    } catch (error) {
        console.error("Error calculating date:", error);
        return null; // Handle error gracefully
    }
};

module.exports = calculateDate;
