/**
 * Settings route for both variants.
 * This page intentionally avoids the modal so it remains a false-positive control surface.
 */
import { Checkbox, Form, FormGroup, TextInput } from '@patternfly/react-core'
import { PageHeader } from '../components/PageHeader'

export function Settings() {
  return (
    <div className="page-stack">
      <PageHeader title="Settings" description="Review notification and reporting defaults for this workspace." />
      <div className="clean-control" role="status"><strong>Clean control route</strong><span>No intentional accessibility barrier is planted on this page.</span></div>
      <section className="settings-section" aria-labelledby="notification-settings-title">
        <div className="section-heading"><div><h2 id="notification-settings-title">Notifications</h2><p>Current values are read-only in the team fixture.</p></div></div>
        <Form isWidthLimited>
          <FormGroup label="Notification email" fieldId="notification-email">
            <TextInput id="notification-email" name="notification-email" type="email" value="ops@example.com" readOnly />
          </FormGroup>
          <FormGroup fieldId="nightly-reports">
            <Checkbox id="nightly-reports" label="Enable nightly accessibility reports" isChecked isDisabled />
          </FormGroup>
        </Form>
      </section>
      <section className="settings-section" aria-labelledby="report-settings-title">
        <div className="section-heading"><div><h2 id="report-settings-title">Evidence reports</h2><p>Receipts remain bound to the exact checked source state.</p></div></div>
        <dl className="settings-list"><div><dt>Retention</dt><dd>30 days</dd></div><div><dt>Export format</dt><dd>JSON and Markdown</dd></div><div><dt>Policy source</dt><dd>Protected repository base</dd></div></dl>
      </section>
    </div>
  )
}
