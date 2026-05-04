import axios from "../../../common/utils/axiosCustomize";

// GET: api/Dashboard/stats?chartDays=7
export const getDashboardStats = (chartDays = 7) =>
    axios.get('/Dashboard/stats', { params: { chartDays } });