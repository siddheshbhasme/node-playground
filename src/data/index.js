import 'dotenv/config';
import { each, waterfall } from "async";
import { readdirSync } from "fs";
import { join } from "path";
import request from "request";

export default class MovieStore {
  constructor() {
    this.movies = [];
    const normalizedPath = join(__dirname, "movies");
    readdirSync(normalizedPath).forEach((file) => {
      this.movies.push(require("./movies/" + file));
    });

    this.ConsolidateDataFromOmdb(this.movies);
  }

  GetMovieById(id) {
    return this.movies.find((x) => x.id.toString() === id || x.imdbId === id);
  }

  GetMoviesByQuery(query) {
    return this.movies.filter((movie) => {
      let matches = true;
      for (const filterKey in query) {
        const value = movie[filterKey];
        const filterValue = query[filterKey];
        if (filterKey === "id") {
          matches = (movie.id.toString() === filterValue || movie.imdbId === filterValue);
        } else if (value === undefined) {
          matches = false;
        } else if (typeof value === "string" && value !== filterValue) {
          matches = false;
        } else if (Array.isArray(value) && !value.includes(filterValue)) {
          matches = false;
        }
      };
      return matches;
    });
  }

  GetAllMovies() {
    return this.movies;
  }

  GetAverageRatingsString(movie) {
    return this.GetAverageRatings(movie.userrating).toString() + "/5";
  }

  GetAverageRatings(ratings) {
    const rating = (ratings.countStar1 +
        2 * ratings.countStar2 +
        3 * ratings.countStar3 +
        4 * ratings.countStar4 +
        5 * ratings.countStar5) /
      ratings.countTotal;

    return Math.round(rating * 10) / 10
  }

  ConsolidateDataFromOmdb(moviesCollection) {
    each(moviesCollection, (movie, next) => {
      // iterate and merge
      waterfall([
        (nextStep) => {
          // request omdb
          request(`http://www.omdbapi.com/?i=${movie.imdbId}&plot=full&apikey=${process.env.API_KEY}`, (error, response, body) => {
            if (error) {
              return nextStep(error);
            }
            const omdbDetails = JSON.parse(body);
            if (omdbDetails.Response === "True") {
              nextStep(null, omdbDetails);
            } else {
              nextStep(omdbDetails);
            }
          });
        },
        (omdbData, nextStep) => {
          Object.keys(omdbData).forEach((key) => {
            if (key === "Title") {
              movie.title = omdbData[key];
            } else if (key === "Plot") {
              movie.description = omdbData[key];
            } else if (key === "Ratings") {
              // const rating = movie.userrating.GetAverageRatingsString();
              omdbData.Ratings.push({
                Source: "User Ratings",
                Value: this.GetAverageRatingsString(movie),
              });
              movie.userrating = omdbData.Ratings;
            } else if (key === "Director" || key === "Writer" || key === "Actors") {
              movie[key.toLowerCase()] = omdbData[key].split(",").map(item => item.trim());
              // skip
            } else if (key === "Language") {
              movie.languages = movie.languages.concat(omdbData[key].split(",").map(item => item.trim()));
              // skip
            } else if (key !== "Runtime" && key !== "Response") {
              const value = omdbData[key];
              key = key.toLowerCase();
              movie[key] = value;
            }
          });
          nextStep();
        },
      ], (result, error) => {
        // handle succes/error
        next(error);
      });
    }, (err) => {
      // handle error
      if (err) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.error('Error occured while consolidating data from OMDB');
        console.error(`Error Details ${err}`);
      } else {
        console.log("Consolidation Succeeded");
      }
    });
  }


}