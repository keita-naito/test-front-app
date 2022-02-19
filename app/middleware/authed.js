export default function ({ store, redirect }) {
  const isSignedIn = store.state.sessionUser.isSignedIn

  if (!isSignedIn) {
    return redirect('/sign_in')
  }
}
