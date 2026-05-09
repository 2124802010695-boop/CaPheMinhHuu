import axios from "../../../common/utils/axiosCustomize";

export const getProductsAPI = () => axios.get("/customer/menu/products");
export const getCategoriesAPI = () => axios.get("/customer/menu/categories");
