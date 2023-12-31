<!-- @format -->
<script lang="ts">
	import AuthCheck from "$lib/components/AuthCheck.svelte";
	import { db, user } from "$lib/firebase";
	import { doc, getDoc, writeBatch } from "firebase/firestore";

	let username = "";
	let loading = false;
	let isAvailable = false;
	let deboundeTimer: NodeJS.Timeout;

	const re = /^(?=[a-zA-Z0-9._]{3,24}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

	$: isValid =
		username?.length > 2 && username.length < 24 && re.test(username);
	$: isTouched = username.length > 0;
	$: isTaken = isValid && !isAvailable && !loading;

	async function checkAvailability() {
		isAvailable = false;
		clearTimeout(deboundeTimer);
		loading = true;

		deboundeTimer = setTimeout(async () => {
			console.log(`checking availability of ${username}`);
			const ref = doc(db, "usernames", username);
			const exists = await getDoc(ref).then((doc) => doc.exists());
			isAvailable = !exists;
			loading = false;
		}, 350);
	}

	async function confirmUsername() {
		console.log("confirming username", username);
		const batch = writeBatch(db);
		batch.set(doc(db, "usernames", username), { uid: $user?.uid });
		batch.set(doc(db, "users", $user), {
			username,
			photoURL: $user?.photoURL ?? null,
			published: true,
			bio: "I am the Walrus",
			links: [
				{
					title: "Test",
					url: "google.com",
					icon: "custom",
				},
			],
		});
		await batch.commit();
		``;
		username = "";
		isAvailable = false;
	}
</script>

<AuthCheck>
	<h2>Username</h2>
	<form class="w-2/5" on:submit|preventDefault={confirmUsername}>
		<input
			type="text"
			placeholder="Username"
			class="input w-full"
			bind:value={username}
			on:input={checkAvailability}
			class:input-error={!isValid && isTouched}
			class:input-warning={isTaken}
			class:input-success={isAvailable && isValid && !loading}
		/>
		<div class="my-4 min-h-16 px-8 w-full">
			{#if loading}
				<p class="text-secondart">
					Checking availability of @{username}...
				</p>
			{/if}

			{#if !isValid && isTouched}
				<p class="text-error text-sm">
					must be 3-24 characters long, alphanumeric only.
				</p>
			{/if}

			{#if isValid && !isAvailable && !loading}
				<p class="text-warning text-sm">
					@{username} is taken.
				</p>
			{/if}

			{#if isAvailable}
				<button class="btn btn-success">Confirm Username</button>
			{/if}
		</div>
	</form>
</AuthCheck>
