import { Router } from "express";
import { GetMovieById, QueryMovies } from "../services";

const router = Router();

const MovieRoutes = Router();

const GetMovie = (req, res) => {
  return res.send(GetMovieById(req.params.id));
};

const SearchMovies = (req, res) => {
  return res.send(QueryMovies(req.query));
};

MovieRoutes.get("/movies/:id", GetMovie);
MovieRoutes.get("/movies", SearchMovies);

export default MovieRoutes;