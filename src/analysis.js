/**
 * [TODO] Step 0: Import the dependencies, fs and papaparse
 */
const fs = require('fs');
const Papa = require('papaparse');

/**
 * [TODO] Step 1: Parse the Data
 *      Parse the data contained in a given file into a JavaScript objectusing the modules fs and papaparse.
 *      According to Kaggle, there should be 2514 reviews.
 * @param {string} filename - path to the csv file to be parsed
 * @returns {Object} - The parsed csv file of app reviews from papaparse.
 */
function parseData(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    const parsed_csv = Papa.parse(data, {
        header: true,
        dynamicTyping: false,
    });
    return parsed_csv;
}

/**
 * [TODO] Step 2: Clean the Data
 *      Filter out every data record with null column values, ignore null gender values.
 *
 *      Merge all the user statistics, including user_id, user_age, user_country, and user_gender,
 *          into an object that holds them called "user", while removing the original properties.
 *
 *      Convert review_id, user_id, num_helpful_votes, and user_age to Integer
 *
 *      Convert rating to Float
 *
 *      Convert review_date to Date
 * @param {Object} csv - a parsed csv file of app reviews
 * @returns {Object} - a cleaned csv file with proper data types and removed null values
 */

function cleanData(csv) {
    const rows = Array.isArray(csv) ? csv : csv?.data || [];
    const cleaned = [];

    const requiredRows = [
        'review_id',
        'user_id',
        'app_name',
        'app_category',
        'review_text',
        'review_language',
        'rating',
        'review_date',
        'verified_purchase',
        'device_type',
        'num_helpful_votes',
        'user_age',
        'user_country',
        'app_version',
    ];

    for (const r of rows) {
        if (requiredRows.some((k) => !r[k] || r[k].trim() === '')) {
            continue;
        }
        const review_id = parseInt(r.review_id);
        const user_id = parseInt(r.user_id);
        const num_helpful_votes = parseInt(r.num_helpful_votes);
        const user_age = parseInt(r.user_age);
        const rating = parseFloat(r.rating);
        const review_date = new Date(
            String(r.review_date).replace(' ', 'T') + 'Z',
        );
        const verified_purchase = r.verified_purchase === 'True';
        const out = {
            review_id,
            app_name: r.app_name,
            app_category: r.app_category,
            review_text: r.review_text,
            review_language: r.review_language,
            rating,
            review_date,
            verified_purchase,
            device_type: r.device_type,
            num_helpful_votes,
            app_version: r.app_version,
            user: {
                user_id,
                user_age,
                user_country: r.user_country,
                user_gender: r.user_gender,
            },
        };

        cleaned.push(out);
    }
    return cleaned;
}

/**
 * [TODO] Step 3: Sentiment Analysis
 *      Write a function, labelSentiment, that takes in a rating as an argument
 *      and outputs 'positive' if rating is greater than 4, 'negative' is rating is below 2,
 *      and 'neutral' if it is between 2 and 4.
 * @param {Object} review - Review object
 * @param {number} review.rating - the numerical rating to evaluate
 * @returns {string} - 'positive' if rating is greater than 4, negative is rating is below 2,
 *                      and neutral if it is between 2 and 4.
 */
function labelSentiment({ rating }) {
    let sentiment = '';
    if (rating > 4) {
        sentiment = 'positive';
    } else if (rating >= 2) {
        sentiment = 'neutral';
    } else {
        sentiment = 'negative';
    }
    return sentiment;
}

/**
 * [TODO] Step 3: Sentiment Analysis by App
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each app into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{app_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for an app
 */
function sentimentAnalysisApp(cleaned) {
    const rows = Array.isArray(cleaned) ? cleaned : cleaned?.rows || [];
    const byApp = new Map();
    for (const r of rows) {
        const sentiment = labelSentiment({ rating: r.rating });
        r.sentiment = sentiment;

        if (!byApp.has(r.app_name)) {
            byApp.set(r.app_name, {
                app_name: r.app_name,
                positive: 0,
                neutral: 0,
                negative: 0,
            });
        }
        byApp.get(r.app_name)[sentiment] += 1;
    }

    const summary = Array.from(byApp.values());
    return summary;
}

/**
 * [TODO] Step 3: Sentiment Analysis by Language
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each language into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{lang_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for a language
 */
function sentimentAnalysisLang(cleaned) {
    const rows = Array.isArray(cleaned) ? cleaned : cleaned?.rows || [];
    const byLanguage = new Map();
    for (const r of rows) {
        const sentiment = labelSentiment({ rating: r.rating });
        r.sentiment = sentiment;

        if (!byLanguage.has(r.review_language)) {
            byLanguage.set(r.review_language, {
                lang_name: r.review_language,
                positive: 0,
                neutral: 0,
                negative: 0,
            });
        }
        byLanguage.get(r.review_language)[sentiment] += 1;
    }

    const summary = Array.from(byLanguage.values());

    return summary;
}

/**
 * [TODO] Step 4: Statistical Analysis
 *      Answer the following questions:
 *
 *      What is the most reviewed app in this dataset, and how many reviews does it have?
 *
 *      For the most reviewed app, what is the most commonly used device?
 *
 *      For the most reviewed app, what the average star rating (out of 5.0)?
 *
 *      Add the answers to a returned object, with the format specified below.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{mostReviewedApp: string, mostReviews: number, mostUsedDevice: String, mostDevices: number, avgRating: float}} -
 *          the object containing the answers to the desired summary statistics, in this specific format.
 */
function summaryStatistics(cleaned) {
    const rows = Array.isArray(cleaned) ? cleaned : cleaned?.rows || [];
    const reviewsByApp = new Map();
    for (const r of rows) {
        const app = r.app_name;
        reviewsByApp.set(app, (reviewsByApp.get(app) || 0) + 1);
    }
    let mostReviews = 0;
    let mostReviewedApp = '';
    for (const [app, count] of reviewsByApp.entries()) {
        if (count > mostReviews) {
            mostReviewedApp = app;
            mostReviews = count;
        }
    }
    const devices = new Map();
    let ratingSum = 0;
    let ratingN = 0;
    for (const r of rows) {
        if (r.app_name !== mostReviewedApp) continue;
        const dev = r.device_type;
        devices.set(dev, (devices.get(dev) || 0) + 1);

        const ratingNum =
            typeof r.rating === 'number' ? r.rating : parseFloat(r.rating);
        if (!Number.isNaN(ratingNum)) {
            ratingSum += ratingNum;
            ratingN += 1;
        }
    }
    let mostDevices = 0;
    let mostUsedDevice = '';
    for (const [dev, count] of devices.entries()) {
        if (count > mostDevices) {
            mostUsedDevice = dev;
            mostDevices = count;
        }
    }
    const avgRating = ratingN ? ratingSum / ratingN : 0;
    return {
        mostReviewedApp,
        mostReviews,
        mostUsedDevice,
        mostDevices,
        avgRating,
    };
}

/**
 * Do NOT modify this section!
 */
module.exports = {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment,
};
