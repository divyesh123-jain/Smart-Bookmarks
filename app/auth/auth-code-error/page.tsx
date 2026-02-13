export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Authentication Error</h1>
        <p className="text-gray-600 dark:text-gray-400">
          There was an error authenticating. Please try again.
        </p>
      </div>
    </div>
  )
}
