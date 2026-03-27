// @ts-nocheck
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useApiRequest from '../useRequest';

const QueryKeys = {
  GenericContacts: 'GenericContacts',
  GenericContact: 'GenericContact',
};

export function useGenericContacts(contactService: string, props = {}) {
  const apiRequest = useApiRequest();
  return useQuery(
    [QueryKeys.GenericContacts, contactService],
    () => apiRequest.get(`/${contactService}s`).then((r) => r.data),
    { ...props },
  );
}

export function useGenericContact(contactService: string, id: number | null, props = {}) {
  const apiRequest = useApiRequest();
  return useQuery(
    [QueryKeys.GenericContact, contactService, id],
    () => apiRequest.get(`/${contactService}s/${id}`).then((r) => r.data),
    { enabled: !!id, ...props },
  );
}

export function useCreateGenericContact(contactService: string, props = {}) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();
  return useMutation(
    (values) => apiRequest.post(`/${contactService}s`, values),
    {
      onSuccess: () => queryClient.invalidateQueries([QueryKeys.GenericContacts, contactService]),
      ...props,
    },
  );
}

export function useEditGenericContact(contactService: string, props = {}) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();
  return useMutation(
    ({ id, ...values }) => apiRequest.put(`/${contactService}s/${id}`, values),
    {
      onSuccess: () => queryClient.invalidateQueries([QueryKeys.GenericContacts, contactService]),
      ...props,
    },
  );
}

export function useDeleteGenericContact(contactService: string, props = {}) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();
  return useMutation(
    (id) => apiRequest.delete(`/${contactService}s/${id}`),
    {
      onSuccess: () => queryClient.invalidateQueries([QueryKeys.GenericContacts, contactService]),
      ...props,
    },
  );
}
