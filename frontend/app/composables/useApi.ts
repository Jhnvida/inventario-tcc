export const useApi = () => {
    const get = <T>(path: string) => useFetch<T>(`/api${path}`, { key: path });
    return { get };
};
