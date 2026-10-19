import {
	Button,
	// eslint-disable-next-line envui/no-renamed-exports -- moving in the next pull request
	TextField,
	// The settings menu.
	Menu,
	Alert,
} from '@envsemble/envui';

export function Form() {
	return (
		<form>
			<Alert>Saved</Alert>
			<TextField label="Name" />
			<Menu.Item>Profile</Menu.Item>
			<Button type="submit">Save</Button>
		</form>
	);
}
