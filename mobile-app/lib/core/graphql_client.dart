import 'dart:convert';
import 'package:http/http.dart' as http;
import '../stores/auth_store.dart';

/// Base URL of your backend's GraphQL endpoint.
///
/// - Android emulator -> host machine localhost is 10.0.2.2
/// - iOS simulator    -> localhost works as-is
/// - Physical device  -> use your machine's LAN IP, e.g. http://192.168.1.20:4000/graphql
const String kGraphQLEndpoint = String.fromEnvironment(
  'GRAPHQL_ENDPOINT',
  defaultValue:
      'https://umpisa-assignment.onrender.com/graphql', // NOTE: Change this to your local IP address to run on your local machine
);

class GraphQLException implements Exception {
  GraphQLException(this.message, {this.code});
  final String message;
  final String? code;

  @override
  String toString() => message;
}

/// Thin wrapper so every query/mutation function in api/api.dart stays a
/// one-liner. This is the "queryFn" / "mutationFn" that fquery calls.
Future<Map<String, dynamic>> gqlRequest(
  String query, {
  Map<String, dynamic>? variables,
}) async {
  final token = authStore.state.token;

  final response = await http.post(
    Uri.parse(kGraphQLEndpoint),
    headers: {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'query': query,
      if (variables != null) 'variables': variables,
    }),
  );

  final body = jsonDecode(response.body) as Map<String, dynamic>;

  if (body['errors'] != null) {
    final errors = body['errors'] as List;
    final first = errors.first as Map<String, dynamic>;
    throw GraphQLException(
      first['message'] as String? ?? 'GraphQL error',
      code: (first['extensions'] as Map<String, dynamic>?)?['code'] as String?,
    );
  }

  return body['data'] as Map<String, dynamic>;
}
