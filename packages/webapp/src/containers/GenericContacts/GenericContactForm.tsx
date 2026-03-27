// @ts-nocheck
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Intent, FormGroup, InputGroup, TextArea } from '@blueprintjs/core';
import { Stack, AppToaster, DashboardInsider } from '@/components';
import { useCreateGenericContact, useEditGenericContact, useGenericContact } from '@/hooks/query/genericContacts';

const validationSchema = Yup.object().shape({
  displayName: Yup.string().required('Display name is required'),
  email: Yup.string().email('Invalid email'),
});

interface GenericContactFormProps {
  contactService: string;
  listPath: string;
  title: string;
}

export function GenericContactForm({ contactService, listPath, title }: GenericContactFormProps) {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading } = useGenericContact(contactService, id ? Number(id) : null);
  const { mutateAsync: createContact } = useCreateGenericContact(contactService);
  const { mutateAsync: editContact } = useEditGenericContact(contactService);

  const initialValues = {
    displayName: existing?.display_name || '',
    firstName: existing?.first_name || '',
    lastName: existing?.last_name || '',
    companyName: existing?.company_name || '',
    email: existing?.email || '',
    workPhone: existing?.work_phone || '',
    personalPhone: existing?.personal_phone || '',
    website: existing?.website || '',
    note: existing?.note || '',
    active: existing?.active ?? true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await editContact({ id: Number(id), ...values });
        AppToaster.show({ intent: Intent.SUCCESS, message: `${title} updated.` });
      } else {
        await createContact(values);
        AppToaster.show({ intent: Intent.SUCCESS, message: `${title} created.` });
      }
      history.push(listPath);
    } catch {
      AppToaster.show({ intent: Intent.DANGER, message: 'Something went wrong.' });
    }
    setSubmitting(false);
  };

  return (
    <DashboardInsider name="generic-contact-form">
      <Stack spacing={20} style={{ padding: 20, maxWidth: 600 }}>
        <h2>{isEdit ? `Edit ${title}` : `New ${title}`}</h2>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
          {({ isSubmitting }) => (
            <Form>
              <Stack spacing={12}>
                <Field name="displayName">
                  {({ field, meta }) => (
                    <FormGroup label="Display Name *" intent={meta.error && meta.touched ? Intent.DANGER : Intent.NONE} helperText={meta.touched && meta.error}>
                      <InputGroup {...field} />
                    </FormGroup>
                  )}
                </Field>
                <Field name="firstName">
                  {({ field }) => <FormGroup label="First Name"><InputGroup {...field} /></FormGroup>}
                </Field>
                <Field name="lastName">
                  {({ field }) => <FormGroup label="Last Name"><InputGroup {...field} /></FormGroup>}
                </Field>
                <Field name="companyName">
                  {({ field }) => <FormGroup label="Company Name"><InputGroup {...field} /></FormGroup>}
                </Field>
                <Field name="email">
                  {({ field, meta }) => (
                    <FormGroup label="Email" intent={meta.error && meta.touched ? Intent.DANGER : Intent.NONE} helperText={meta.touched && meta.error}>
                      <InputGroup {...field} type="email" />
                    </FormGroup>
                  )}
                </Field>
                <Field name="workPhone">
                  {({ field }) => <FormGroup label="Work Phone"><InputGroup {...field} /></FormGroup>}
                </Field>
                <Field name="personalPhone">
                  {({ field }) => <FormGroup label="Personal Phone"><InputGroup {...field} /></FormGroup>}
                </Field>
                <Field name="website">
                  {({ field }) => <FormGroup label="Website"><InputGroup {...field} /></FormGroup>}
                </Field>
                <Field name="note">
                  {({ field }) => <FormGroup label="Note"><TextArea {...field} fill rows={3} /></FormGroup>}
                </Field>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="submit" intent={Intent.PRIMARY} loading={isSubmitting}>
                    {isEdit ? 'Save Changes' : `Create ${title}`}
                  </Button>
                  <Button onClick={() => history.push(listPath)}>Cancel</Button>
                </div>
              </Stack>
            </Form>
          )}
        </Formik>
      </Stack>
    </DashboardInsider>
  );
}
