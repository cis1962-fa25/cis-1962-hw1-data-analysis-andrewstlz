/**
 * You may use this file to call the functions within your code for testing purposes.
 * Code written in this file will not be graded or submitted.
 * The steps are labeled for your convenience.
 */
const {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
} = require('./analysis');

/**
 * Step 1: Call the parseData function
 *      From the analysis.js file, call the parseData method with the correct file path to the data file.
 */

const csv = parseData('src\multilingual_mobile_app_reviews_2025.csv');

/**
 * Step 2: Call the cleanData function
 *      Pass the csv as an argument to the cleanData function.
 */

cleaned = cleanData(csv);

/**
 * Step 3: Sentiment Analysis
 *      Call the printSentimentAnalysis function get a summary
 *      of the sentiments of apps across different apps and languages.
 */

sentimentAnalysisApp(cleaned);
sentimentAnalysisLang(cleaned);

/**
 * Step 4: Statistical Analysis
 *      Call the printAnalysis function to get some summary statistics of the cleaned data.
 */

summaryStatistics(cleaned);
