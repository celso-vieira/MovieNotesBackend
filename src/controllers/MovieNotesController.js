const knex = require('../database/knex')

class MovieNotesController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body
        const { user_id } = request.params

        const [ note_id ] = await knex("movieNotes").insert({
           title,
           description,
           rating,
           user_id 
        })

        const tagsInsert = tags.map(name => {
            return {
                note_id,
                name,
                user_id
            }
        })

        await knex("movieTags").insert(tagsInsert)

        return response.json()
    }

    async show(request, response) {
        const { id } = request.params

        const note = await knex("movieNotes").where({ id }).first()
        const tags = await knex("movieTags").where({ note_id: id }).orderBy("name")

        return response.json({
            ...note,
            tags
        })
    }

    async delete(request, response) {
        const { id } = request.params

        await knex("movieNotes").where({ id }).delete()

        return response.json()
    }

    async index(request, response) {
        const { user_id, title, rating, tags } = request.query

        let notes

        if(tags) {
            const filterTags = tags.split(',').map(tag => tag.trim())

            notes = await knex("movieTags")
            .innerJoin("movieNotes", "movieNotes.id", "movieTags.note_id")
            .select([
                "movieNotes.id",
                "movieNotes.title",
                "movieNotes.rating",
                "movieNotes.user_id"
            ])
            .whereLike("movieNotes.title", `%${title}%`)
            .whereIn("name", filterTags)
            .where("movieNotes.rating", rating)
            .where("movieNotes.user_id", user_id)
            .orderBy("movieNotes.title")
        } 
        else {
            notes = await knex("movieNotes").where({ user_id })
            .whereLike('title', `%${title}%`)
            .where({ rating })
            .orderBy('title')
        }

        const userTags = await knex("movieTags").where({ user_id })
        const notesWithTags = notes.map(note => {
            const noteTags = userTags.filter(tag => tag.note_id === note.id)

            return {
                ...note,
                tags: noteTags
            }
        })

        return response.json( notesWithTags )
    }

}

module.exports = MovieNotesController