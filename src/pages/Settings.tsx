/**
 * Settings route for both variants.
 * This page intentionally avoids the modal so it remains a false-positive control surface.
 */
import { Card, CardBody, CardTitle, Checkbox, Form, FormGroup, TextInput } from '@patternfly/react-core'

export function Settings() {
  return (
    <Card isCompact>
      <CardTitle>Settings</CardTitle>
      <CardBody>
        <Form isWidthLimited>
          <FormGroup label="Notification email" fieldId="notification-email">
            <TextInput id="notification-email" name="notification-email" type="email" value="ops@example.com" readOnly />
          </FormGroup>
          <FormGroup fieldId="nightly-reports">
            <Checkbox id="nightly-reports" label="Enable nightly accessibility reports" isChecked isDisabled />
          </FormGroup>
        </Form>
      </CardBody>
    </Card>
  )
}
