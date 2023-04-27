import { Router } from "express";
const router = Router();
import validator from "../validator.js";
import *  as userData from "../data/users.js";

router.route("/").get(async (req, res) => {
  return res.status(400).render('error', { title: 'Error', error: 'No user id provided' });
});

router.route("/:id").get(async (req, res) => {
    try {
        let id = req.params.id;
        id = validator.checkId(id, "userId");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        let user = await userData.get(id);
        return res.render('user', { title: user.userName, user: user});
    } catch (e) {
        return res.status(404).render('error', { title: 'Error', error: 'User not found' });
    }
});

export default router;
