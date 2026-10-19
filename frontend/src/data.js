export const genres = [
  "All",
  "Action",
  "Sci-Fi",
  "Drama",
  "Romance",
];

export const featuredMovie = {
  title: "Dune: Part Two",
  image: "1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  backdrop: "1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  rating: "8.5",
  genres: ["Adventure", "Sci-Fi"],
};

export const theatres = [
  {
    id: 1,
    name: "PVR Cinemas",
    location: "C21 Mall, Indore",
    distance: "2.4 km",
    times: ["10:30 AM", "01:45 PM", "06:30 PM", "09:45 PM"],
  },
  {
    id: 2,
    name: "INOX",
    location: "Treasure Island Mall, Indore",
    distance: "3.1 km",
    times: ["11:15 AM", "02:30 PM", "07:00 PM", "10:15 PM"],
  },
  {
    id: 3,
    name: "Cinepolis",
    location: "Indore",
    distance: "4.5 km",
    times: ["09:45 AM", "12:45 PM", "04:15 PM", "08:30 PM"],
  },
];

export const imageUrl = (path, width = "w500") =>
  `https://image.tmdb.org/t/p/${width}/${path}`;