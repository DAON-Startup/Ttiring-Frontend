import { Configuration, DefaultApi } from "../generated";

const config = new Configuration({
  basePath: "http://localhost:8080",
});

// 전체 API 묶음
export const api = new DefaultApi(config);
