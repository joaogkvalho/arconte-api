export interface Game {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  total_rating?: number;
  first_release_date?: number;
  genres?: GameGenre[];
  platforms?: GamePlatform[];
  cover?: GameCover;
}

export interface GameDetails extends Game {
  screenshots?: GameScreenshot[];
  videos?: GameVideo[];
  involved_companies?: InvolvedCompany[];
  similar_games?: SimilarGame[];
  websites?: GameWebsite[];
}

export interface GameGenre {
  id: number;
  name: string;
}

export interface GamePlatform {
  id: number;
  name: string;
}

export interface GameCover {
  id: number;
  url: string;
}

export interface GameScreenshot {
  id: number;
  url: string;
  width?: number;
  height?: number;
}

export interface GameVideo {
  id: number;
  name?: string;
  video_id: string;
}

export interface InvolvedCompany {
  id: number;
  developer: boolean;
  publisher: boolean;
  company: {
    id: number;
    name: string;
  };
}

export interface SimilarGame {
  id: number;
  name: string;
  cover?: GameCover;
  rating?: number;
}

export interface GameWebsite {
  id: number;
  url: string;
  category: number;
}
