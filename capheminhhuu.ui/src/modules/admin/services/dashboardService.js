import axios from "../../../common/utils/axiosCustomize";

// GET: api/Dashboard/stats?chartDays=7
export const getDashboardStats = (chartDays = 7) =>
    axios.get('/Dashboard/stats', { params: { chartDays } });

export const getDashboardRangeStats = (from, to) =>
    axios.get('/Dashboard/stats/range', {
        params: {
            from: from.toISOString().split('T')[0],
            to:   to.toISOString().split('T')[0],
        }
    });