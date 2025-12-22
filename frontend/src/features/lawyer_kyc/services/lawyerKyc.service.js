import api from "../../../services/api";


export const submitKyc = (data) => {
  return api.post("/kyc/", data);
};


export const getMyKyc = () => {
  return api.get("/kyc/my");
};
