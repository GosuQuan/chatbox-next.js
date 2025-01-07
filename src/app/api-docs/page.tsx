import React from 'react';

export default function ApiDocs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>
      
      <div className="space-y-8">
        {/* Todos API */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Todos API</h2>
          
          <div className="space-y-6">
            {/* GET /api/todos */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded">GET</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/todos</code>
              </div>
              <p className="text-gray-600 mb-2">Get all todos for the current user</p>
              <div className="mb-2">
                <h4 className="font-medium">Headers:</h4>
                <code className="block bg-gray-100 p-2 rounded">
                  Authorization: Bearer {`{token}`}
                </code>
              </div>
              <div className="mb-2">
                <h4 className="font-medium">Response:</h4>
                <pre className="bg-gray-100 p-2 rounded">
{`{
  "todos": [
    {
      "id": number,
      "text": "string",
      "completed": boolean
    }
  ]
}`}
                </pre>
              </div>
            </div>

            {/* POST /api/todos */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded">POST</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/todos</code>
              </div>
              <p className="text-gray-600 mb-2">Create a new todo</p>
              <div className="mb-2">
                <h4 className="font-medium">Headers:</h4>
                <code className="block bg-gray-100 p-2 rounded">
                  Authorization: Bearer {`{token}`}<br />
                  Content-Type: application/json
                </code>
              </div>
              <div className="mb-2">
                <h4 className="font-medium">Request Body:</h4>
                <pre className="bg-gray-100 p-2 rounded">
{`{
  "text": "string"
}`}
                </pre>
              </div>
            </div>

            {/* PUT /api/todos/:id */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded">PUT</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/todos/:id</code>
              </div>
              <p className="text-gray-600 mb-2">Update a todo</p>
              <div className="mb-2">
                <h4 className="font-medium">Headers:</h4>
                <code className="block bg-gray-100 p-2 rounded">
                  Authorization: Bearer {`{token}`}<br />
                  Content-Type: application/json
                </code>
              </div>
              <div className="mb-2">
                <h4 className="font-medium">Request Body:</h4>
                <pre className="bg-gray-100 p-2 rounded">
{`{
  "id": "string",
  "completed": boolean,
  "text": "string"  // optional
}`}
                </pre>
              </div>
            </div>

            {/* DELETE /api/todos */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded">DELETE</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/todos?id=:id</code>
              </div>
              <p className="text-gray-600 mb-2">Delete a todo</p>
              <div className="mb-2">
                <h4 className="font-medium">Headers:</h4>
                <code className="block bg-gray-100 px-2 py-1 rounded">
                  Authorization: Bearer {`{token}`}
                </code>
              </div>
              <div className="mb-2">
                <h4 className="font-medium">Query Parameters:</h4>
                <code className="block bg-gray-100 p-2 rounded">
                  id: string (required)
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Base URLs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Base URLs</h2>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium">Development:</h4>
              <code className="block bg-gray-100 p-2 rounded">http://localhost:3000/api</code>
            </div>
            <div>
              <h4 className="font-medium">Production:</h4>
              <code className="block bg-gray-100 p-2 rounded">https://your-domain.com/api</code>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
          <p className="text-gray-600">
            All API endpoints require authentication. You need to include a valid JWT token in the Authorization header of your requests.
          </p>
        </section>
      </div>
    </div>
  );
}
