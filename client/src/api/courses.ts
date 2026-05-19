import API from './axios';

export const fetchAllCourses = async (userId: string) => {
    try {
        const response = await API.get(`/courses?userId=${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching courses:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to load courses';
    }
};

export const fetchUserHistory = async (userId: string) => {
    try {
        const response = await API.get(`/prompts/history/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching user history:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to load learning history';
    }
};

export const fetchSubcategories = async () => {
    try {
        const response = await API.get('/categories/subcategories');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching subcategories:', error);
        return [];
    }
};

export const generateAISession = async (payload: {
    userId: string;
    categoryId: string;
    subCategoryId: string;
    prompt: string;
}) => {
    const response = await API.post('/prompts/generate', payload);
    return response.data;
};
