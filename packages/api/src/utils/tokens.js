import jwt from 'jsonwebtoken';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'actions';
const CLIENT_ID = process.env.CLIENT_ID || 'actions-app';

const getKeycloakPublicKey = async () => {
	const response = await fetch(`http://keycloak:8080/realms/actions/protocol/openid-connect/certs`);
	const { keys } = await response.json();
	const key = keys[0].x5c[0];
	return `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
};

export async function verifyToken(token) {
	const publicKey = await getKeycloakPublicKey();
	// console.log(token)
	// console.log(publicKey);
	try {
		const decodedToken = jwt.verify(token, publicKey, {
			audience: 'account',
			issuer: `http://localhost:5002/realms/actions`,
		});
		return decodedToken;
	} catch (error) {
		return false;
		// console.log(error);
		// throw new Error('Token verification failed');
	}
	// const res = await fetch('http://keycloak:8080/realms/actions/protocol/openid-connect/userinfo', {
	//   method: 'GET',
	//   headers: {
	//     'Content-Type': 'application/json',
	//     'Authorization': 'Bearer ' + token,
	//   },
	// });

	// console.log(res);

	// return await res.json();
}
