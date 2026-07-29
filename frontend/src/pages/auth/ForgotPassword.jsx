function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Send Reset Link
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;