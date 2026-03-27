// @ts-nocheck
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Intent, HTMLTable, NonIdealState, Spinner } from '@blueprintjs/core';
import { Stack } from '@/components';
import { useGenericContacts, useDeleteGenericContact } from '@/hooks/query/genericContacts';
import { AppToaster } from '@/components';

interface GenericContactsListProps {
  contactService: string;
  newContactPath: string;
  title: string;
}

export function GenericContactsList({ contactService, newContactPath, title }: GenericContactsListProps) {
  const history = useHistory();
  const { data, isLoading } = useGenericContacts(contactService);
  const { mutateAsync: deleteContact } = useDeleteGenericContact(contactService);

  const contacts = data?.data || [];

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact(id);
      AppToaster.show({ intent: Intent.SUCCESS, message: 'Contact deleted.' });
    } catch {
      AppToaster.show({ intent: Intent.DANGER, message: 'Failed to delete contact.' });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <Stack spacing={16} style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Button intent={Intent.PRIMARY} onClick={() => history.push(newContactPath)}>
          New {title.slice(0, -1)}
        </Button>
      </div>

      {contacts.length === 0 ? (
        <NonIdealState title={`No ${title} yet`} description={`Click "New ${title.slice(0, -1)}" to add one.`} />
      ) : (
        <HTMLTable striped bordered style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.display_name}</td>
                <td>{contact.email || '-'}</td>
                <td>{contact.work_phone || contact.personal_phone || '-'}</td>
                <td>{contact.company_name || '-'}</td>
                <td>
                  <Button small onClick={() => history.push(`${newContactPath.replace('/new', '')}/${contact.id}/edit`)}>Edit</Button>
                  {' '}
                  <Button small intent={Intent.DANGER} onClick={() => handleDelete(contact.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      )}
    </Stack>
  );
}
