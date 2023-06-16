export function allAccess(req, res) {
    res.status(200).send({ message: 'Public Content.' });
};

export function userBoard(req, res) {
    res.status(200).send({ message: 'User Content.' });
};

export function adminBoard(req, res) {
    res.status(200).send({ message: 'Admin Content.' });
};

export function moderatorBoard(req, res) {
    console.log(req.userId);
    res.status(200).send({ message: 'Moderator Content.' });
};

export function adminandmodBoard(req, res) {
    res.status(200).send({ message: 'Admin and Moderator Content.' });
};