import MovieStore from "../data";

const store = new MovieStore();

const GetMovieById = (id = null) => {
  if (id) {
    return store.GetMovieById(id);
  } else {
    return store.GetAllMovies();
  }
};

const QueryMovies = (query = "") => {
  return store.GetMoviesByQuery(query);
};

export {
  GetMovieById,
  QueryMovies,
};