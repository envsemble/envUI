import {
	Button,
	// eslint-disable-next-line envui/no-renamed-exports -- moving in the next pull request
	Input,
	// The settings menu.
	MenuItem,
	Notice,
} from '@envsemble/envui';

export function Form() {
	return (
		<form>
			<Notice>Saved</Notice>
			<Input label="Name" />
			<MenuItem>Profile</MenuItem>
			<Button type="submit">Save</Button>
		</form>
	);
}
