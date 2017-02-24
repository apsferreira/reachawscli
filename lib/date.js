exports.formatDate = function (date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        hourFormatted = hour % 12 || 12,
        dayFormatted = day < 10 ? "0" + day : day,
        monthFormatted = month < 10 ? "0" + month : month,
        minuteFormatted = minute < 10 ? "0" + minute : minute,
        secondFormatted = second < 10 ? "0" + second : second,
        morning = hour < 12 ? "am" : "pm";

    return monthFormatted + "/" + dayFormatted + "/" + year + " " + hourFormatted + ":" +
            minuteFormatted + ":" + secondFormatted + morning;
}