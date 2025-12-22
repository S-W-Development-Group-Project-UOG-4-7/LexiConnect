import axios from "../../../lib/axios";

export const submitKyc = (data) => {
  return axios.post("/api/kyc", data);
};

export const getMyKyc = () => {
  return axios.get("/api/kyc/me");
};
