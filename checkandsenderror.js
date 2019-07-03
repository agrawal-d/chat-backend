function senderror(err, res) {
    if (err) {
        res.json({
            error: err
        })

        return true

    }
    return false;
}

module.exports = senderror;