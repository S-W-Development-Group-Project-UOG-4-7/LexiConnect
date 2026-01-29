import api from "../../../services/api";

export const submitKyc = (data) => {
  return api.post("/kyc", data);
};

export const getMyKyc = () => {
  return api.get("/kyc/me");
};

export const normalizeKycStatus = (data) => {
  const raw =
    data?.status ??
    data?.kycStatus ??
    data?.kyc_status ??
    data?.kyc?.status ??
    data?.submission_status;

  if (!raw) return "not_submitted";
  return String(raw).toLowerCase();
};

export const getMyKycStatus = async () => {
  try {
    const res = await getMyKyc();
    return normalizeKycStatus(res?.data || {});
  } catch (err) {
    if (err?.response?.status === 404) return "not_submitted";
    return "not_submitted";
  }
};
