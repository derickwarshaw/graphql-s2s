/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
var browserctxt = typeof(chai) != 'undefined'
/*eslint-disable */
var assert = browserctxt ? chai.assert : null
/*eslint-enable */

function normalizeString(s) {
  if (s) {
    return s.replace(/\n|\t|\s/g, '')
  } 
  else
    return ''
}

var runtest = function(s2s, assert) {
  var compressString = function(s) { return s.replace(/[\n\r]+/g, '').replace(/[\t\r]+/g, '').replace(/ /g,'') }
  var getSchemaAST = s2s.getSchemaAST
  var transpileSchema = s2s.transpileSchema
  var extractGraphMetadata = s2s.extractGraphMetadata
  var getGenericAlias = s2s.getGenericAlias
  var getQueryAST = s2s.getQueryAST
  var buildQuery = s2s.buildQuery
  var isTypeGeneric = s2s.isTypeGeneric

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getGenericAlias', () => 
      it('Should .', () => {
        /*eslint-enable */
        var func = '(T => T + "s")'
        var genericType = 'Paged<Product>'
        var getAlias = getGenericAlias(func)
        var alias = getAlias(genericType)
        assert.equal(alias,'Products')

        var getAlias_2 = getGenericAlias()
        var alias_2 = getAlias_2(genericType)
        assert.equal(alias_2,'PagedProduct')

        var func_3 = '((T,U) => T + "sPer" + U)'
        var genericType_3 = 'Paged<Product, User>'
        var getAlias_3 = getGenericAlias(func_3)
        var alias_3 = getAlias_3(genericType_3)
        assert.equal(alias_3,'ProductsPerUser')

        var genericType_4 = 'Paged<Product, User>'
        var getAlias_4 = getGenericAlias()
        var alias_4 = getAlias_4(genericType_4)
        assert.equal(alias_4,'PagedProductUser')
      })))

  var schema_input_vndfis = `
  # This is some description of 
  # what a Post object is.
  type Post {
    id: ID! 
    # A name is a property.
    name: String!
  }

  type PostUserRating {
    # Rating indicates the rating a user gave 
    # to a post.
    rating: PostRating!
  }`

  var schema_output_vndfis = `
  # This is some description of 
  # what a Post object is.
  type Post {
    id: ID! 
    # A name is a property.
    name: String!
  }

  type PostUserRating {
    # Rating indicates the rating a user gave 
    # to a post.
    rating: PostRating!
  }`

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 01 - BASICS', () => 
      it('Should not affect a standard schema after transpilation.', () => {
        /*eslint-enable */
        var output = transpileSchema(schema_input_vndfis)
        var answer = compressString(output)
        var correct = compressString(schema_output_vndfis)
        assert.equal(answer,correct)
      })))

  var schema_input_vnwdvs = `
  type Query {
    bars: [Bar]!
  }
  type Bar {
    id: ID
  }
  type Foo {
    id: String!
  }
  extend    type Query {
    foos: [Foo]!
  }`
  
  var schema_output_vnwdvs = `
  type Query {
    bars: [Bar]!
  }
  type Bar {
    id: ID
  }
  type Foo {
    id: String!
  }
  extend type Query {
    foos: [Foo]!
  }`

  /*eslint-disable */
  describe('graphqls2s', () => 
    // This was added on the 28th of Oct following a reported bug that the 'extend' keyword was erased after the transpiled operation.
    // Ref: 
    // - Name: The keyword "extend" is lost #1
    // - Raised by: kaihaase-wd 
    describe('#transpileSchema: 02 - SUPPORT THE EXTEND KEYWORD', () => 
      it(`Should support extending schema using the 'extend' keyword.`, () => {
        /*eslint-enable */
        var output = transpileSchema(schema_input_vnwdvs)
        var answer = compressString(output)
        var correct = compressString(schema_output_vnwdvs)
        assert.equal(answer,correct)
      })))

  var schema_input_1 = `
  type Post {
    id: ID! 
    name: String!
  }

  type PostUserRating inherits Post {
    rating: PostRating!
  }
  `
  var schema_output_1 = `
  type Post {
      id: ID!
      name: String!
  }

  type PostUserRating {
      id: ID!
      name: String!
      rating: PostRating!
  }`

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 03 - INHERITANCE', () => 
      it('Should add properties from the super type to the sub type.', () => {
        /*eslint-enable */
        var output = transpileSchema(schema_input_1)
        var answer = compressString(output)
        var correct = compressString(schema_output_1)
        assert.equal(answer,correct)
      })))

  var schema_input_xdwe3d = `
  type Person {
    firstname: String
    lastname: String
  }

  type User { #inherits Person {
    username: String!
    posts: [Post]
  }
  `
  var schema_output_xdwe3d = `
  type Person {
    firstname: String
    lastname: String
  }

  type User {
      #inherits Person {
      username: String!
      posts: [Post]
  }
  `
  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 04 - COMMENTED INHERITANCE', () => 
      it('Should not let a type inherits from a super type when the \'inherits\' keyword has been commented out on the same line (e.g. \'type User { #inherits Person {\').', () => {
        /*eslint-enable */
        var output = transpileSchema(schema_input_xdwe3d)
        var answer = compressString(output)
        var correct = compressString(schema_output_xdwe3d)
        assert.equal(answer,correct)
      })))

  var schema_input_2 = `
  type Paged<T> {
    data: [T]
    cursor: ID
  }

  type User {
    posts: Paged<Post>
  }
  `
  var schema_output_2 = `
  type User {
    posts: PagedPost
  }
  type PagedPost {
    data: [Post]
    cursor: ID
  }
  `
  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 05 - GENERIC TYPES', () => 
      it('Should create a new type for each instance of a generic type, as well as removing the original generic type definition.', () => {
        /*eslint-enable */
        var output = transpileSchema(schema_input_2)
        var answer = compressString(output)
        var correct = compressString(schema_output_2)
        assert.equal(answer,correct)
      })))

  var schema_input_3 = `
  @node
  type Brand {
    id: ID!
    name: String
    @edge('<-[ABOUT]-')
    posts: [Post]
  }

  @miracle
  input User {
    posts: [Post]
  }
  `
  var schema_output_3 = `
  type Brand {
    id: ID!
    name: String
    posts: [Post]
  }

  input User {
    posts: [Post]
  }
  `
  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 06 - REMOVE METADATA', () => 
      it('Should remove any metadata from the GraphQL schema so it can be compiled by Graphql.js.', () => {
        /*eslint-enable */
        var output = transpileSchema(schema_input_3)
        var answer = compressString(output)
        var correct = compressString(schema_output_3)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 07 - ALIASES SUPPORT FOR GENERIC TYPES WITH THE @alias METADATA', () => 
      it('Should allow to define custom names in generic types', () => {
        /*eslint-enable */
        var schema = `
        type Brand {
          id: ID!
          name: String
          posts: Page<Post>
        }

        @alias((T) => T + 's')
        type Page<T> {
          data: [T]
        }
        `
        var schema_output = `
        type Brand {
          id: ID!
          name: String
          posts: Posts
        }

        type Posts {
          data: [Post]
        }
        `
        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 08 - COMPLEX COMMENTS WITH MARKDOWN CODE BLOCKS', () => 
      it('Should successfully transpile the schema even when there are complex markdown comments containing code blocks.', () => {
        /*eslint-enable */
        var schema = `
        # ### Page - Pagination Metadata
        # The Page object represents metadata about the size of the dataset returned. It helps with pagination.
        # Example:
        #
        # \`\`\`js
        # getData(first: 100, skip: 200)
        # \`\`\`
        # Skips the first 200 items, and gets the next 100.
        #
        # To help represent this query using pages, GraphHub adds properties like _current_ and _total_. In the
        # example above, the returned Page object could be:
        #
        # \`\`\`js
        # {
        # first: 100,
        # skip: 200,
        # current: 3,
        # total: {
        #   size: 1000,
        #   pages: 10
        # }
        # }
        # \`\`\`
        type Page {
          # The pagination parameter sent in the query
          first: Int!

          # The pagination parameter sent in the query
          skip: Int!

          # The convertion from 'first' and 'after' in terms of the current page
          # (e.g. { first: 100, after: 200 } -> current: 3).
            current: Int!

            # Inspect the total size of your dataset ignoring pagination.
            total: DatasetSize
        }

        # ### DatasetSize - Pagination Metadata
        # Used in the Page object to describe the total number of pages available.
        type DatasetSize {
          size: Int!
          pages: Int!
        }
        `
        var schema_output = `
        # ### Page - Pagination Metadata
        # The Page object represents metadata about the size of the dataset returned. It helps with pagination.
        # Example:
        #
        # \`\`\`js
        # getData(first: 100, skip: 200)
        # \`\`\`
        # Skips the first 200 items, and gets the next 100.
        #
        # To help represent this query using pages, GraphHub adds properties like _current_ and _total_. In the
        # example above, the returned Page object could be:
        #
        # \`\`\`js
        # {
        # first: 100,
        # skip: 200,
        # current: 3,
        # total: {
        #   size: 1000,
        #   pages: 10
        # }
        # }
        # \`\`\`
        type Page {
            # The pagination parameter sent in the query
            first: Int!
            # The pagination parameter sent in the query
            skip: Int!
            # The convertion from 'first' and 'after' in terms of the current page
            # (e.g. { first: 100, after: 200 } -> current: 3).
            current: Int!
            # Inspect the total size of your dataset ignoring pagination.
            total: DatasetSize
        }

        # ### DatasetSize - Pagination Metadata
        # Used in the Page object to describe the total number of pages available.
        type DatasetSize {
            size: Int!
            pages: Int!
        }`
        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 09 - SUPPORT FOR SCALAR', () => 
      it('Should support custom scalar types.', () => {
        /*eslint-enable */
        var schema_input = `scalar Date
      scalar Like

        # This is some description of 
        # what a Post object is plus an attemp to fool the scalar type.
        type Post {
          id: ID! 
          # A name is a property.
          name: String!
          creationDate: Date
          likeRate: Like
        }

        scalar Strength

        type Test { id: ID }

        type PostUserRating {
          # Rating indicates the rating a user gave 
          # to a post. Fooling test: type Test { id: ID }
          rating: Strength!
        }`

        var schema_output = `
        # This is some description of 
        # what a Post object is plus an attemp to fool the scalar type.
        type Post {
          id: ID! 
          # A name is a property.
          name: String!
          creationDate: Date
          likeRate: Like
        }

        type Test { id: ID }

        type PostUserRating {
          # Rating indicates the rating a user gave 
          # to a post. Fooling test: type Test { id: ID }
          rating: Strength!
        }


        scalar Date
        scalar Like
        scalar Strength`
        var output = transpileSchema(schema_input)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 10 - SUPPORT FOR UNION', () => 
      it('Should support union types.', () => {
        /*eslint-enable */
        var schema = `scalar Date
      scalar Like

        union Product = Bicycle | Racket
      union Details    =     PriceDetails | RacketDetails     

        # This is some description of 
        # what a Post object is plus an attemp to fool the union type.
        type Post {
          id: ID! 
          # A name is a property.
          name: String!
          creationDate: Date
          likeRate: Like
        }

        scalar Strength

        type Test { id: ID }

        type PostUserRating {
          # Rating indicates the rating a user gave 
          # to a post. Fooling test: type Test { id: ID }
          rating: Strength!
        }`

        var schema_output = `
        # This is some description of 
        # what a Post object is plus an attemp to fool the union type.
        type Post {
          id: ID! 
          # A name is a property.
          name: String!
          creationDate: Date
          likeRate: Like
        }

        type Test { id: ID }

        type PostUserRating {
          # Rating indicates the rating a user gave 
          # to a post. Fooling test: type Test { id: ID }
          rating: Strength!
        }


        scalar Date
        scalar Like
        scalar Strength
        union Product = Bicycle | Racket
        union Details = PriceDetails | RacketDetails`
        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 11 - NESTED GENERIC TYPES', () => 
      it('Should create a new type for each instance of a generic type, as well as removing the original generic type definition.', () => {
        /*eslint-enable */

        var schema = `
        type StandardData<T> {
          id: ID!
          value: T
        }

        type Paged<T> {
          data: [StandardData<T>]
          cursor: ID
        }

        type User {
          posts: Paged<Post>
        }
        `
        var schema_output = `
        type User {
          posts: PagedPost
        }

        type StandardDataPost {
          id: ID!
          value: Post
        }

        type PagedPost {
          data: [StandardDataPost]
          cursor: ID
        }
        `

        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)

        // More complicated test
        
        var schema_01 = `
        type AnotherDeeperGeneric<T> {
          data: T
        }

        type StandardData<T> {
          id: ID!
          value: T
          magic: AnotherDeeperGeneric<T>
        }

        type Paged<T> {
          data: [StandardData<T>]
          cursor: ID
        }

        type User {
          posts: Paged<Post>
        }
        `
        var schema_output_01 = `
        type User {
          posts: PagedPost
        }

        type AnotherDeeperGenericPost {
          data: Post
        }

        type StandardDataPost {
          id: ID!
          value: Post
          magic: AnotherDeeperGenericPost
        }

        type PagedPost {
          data: [StandardDataPost]
          cursor: ID
        }`

        var output_01 = transpileSchema(schema_01)
        var answer_01 = compressString(output_01)
        var correct_01 = compressString(schema_output_01)
        assert.equal(answer_01,correct_01)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 12 - NESTED REQUIRED GENERIC TYPES', () => 
      it('Should create a new type for each instance of a generic type, as well as removing the original generic type definition.', () => {
        /*eslint-enable */

        var schema = `
        type StandardData<T> {
          id: ID!
          value: T
        }

        type Paged<T> {
          data: [StandardData<T>]!
          cursor: ID
        }

        type User {
          posts: Paged<Post>!
        }
        `
        var schema_output = `
        type User {
          posts: PagedPost!
        }

        type StandardDataPost {
          id: ID!
          value: Post
        }

        type PagedPost {
          data: [StandardDataPost]!
          cursor: ID
        }
        `

        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 13 - ALIASES SUPPORT FOR NESTED GENERIC TYPES WITH THE @alias METADATA', () => 
      it('Should allow to define custom names in nested generic types', () => {
        /*eslint-enable */
        var schema = `
        @alias((T) => 'Standard' + T)
        type StandardData<T> {
          id: ID!
          value: T
        }

        @alias((T) => T + 's')
        type Paged<T> {
          data: [StandardData<T  >]
          cursor: ID
        }

        type User {
          posts: Paged<Post  >
        }
        `
        var schema_output = `
        type User {
          posts: Posts
        }

        type StandardPost {
          id: ID!
          value: Post
        }

        type Posts {
          data: [StandardPost]
          cursor: ID
        }
        `

        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#transpileSchema: 14 - NESTED GENERIC TYPES WITH MULTI TYPES', () => 
      it('Should create a new type for each instance of a generic type, even for generic with multi-types, as well as removing the original generic type definition.', () => {
        /*eslint-enable */

        var schema = `
        type StandardData<T,U> {
          id: ID!
          value: T
          Dimension: U
        }

        type Paged<T,U> {
          data: [StandardData< T, U>]
          cursor: ID
        }

        type User {
          posts: Paged<Post, Date>
        }
        `
        var schema_output = `
        type User {
          posts: PagedPostDate
        }

        type StandardDataPostDate {
          id: ID!
          value: Post
          Dimension: Date
        }

        type PagedPostDate {
          data: [StandardDataPostDate]
          cursor: ID
        }
        `

        var output = transpileSchema(schema)
        var answer = compressString(output)
        var correct = compressString(schema_output)
        assert.equal(answer,correct)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#isTypeGeneric', () => 
      it('Should test whether or not a type is a generic type based on predefined type constraints.', () => {
        /*eslint-enable */

        assert.isOk(isTypeGeneric('T', 'T'), '\'T\', \'T\' should work.')
        assert.isOk(isTypeGeneric('T', 'T,U'), '\'T\', \'T,U\' should work.')
        assert.isOk(isTypeGeneric('Paged<T>', 'T'), '\'Paged<T>\', \'T\' should work.')
        assert.isOk(isTypeGeneric('[T]', 'T'), '\'[T]\', \'T\' should work.')
        assert.isOk(isTypeGeneric('[Paged<T>]', 'T'), '\'[Paged<T>]\', \'T\' should work.')
        assert.isOk(!isTypeGeneric('Product', 'T'), '\'Product\', \'T\' should NOT work.')
        assert.isOk(!isTypeGeneric('Paged<Product>', 'T'), '\'Paged<Product>\', \'T\' should NOT work.')
        assert.isOk(!isTypeGeneric('[Paged<Product>]', 'T'), '\'[Paged<Product>]\', \'T\' should NOT work.')
      })))

  /*eslint-disable */ 
  describe('graphqls2s', () => 
    describe('#extractGraphMetadata: EXTRACT METADATA', () => 
      it('Should extract all metadata (i.e. data starting with \'@\') located on top of schema types of properties.', () => {
        /*eslint-enable */
        var output = extractGraphMetadata(schema_input_3)
        //console.log(inspect(output));
        assert.isOk(output)
        assert.isOk(output.length)
        assert.equal(output.length, 3)
        var meta1 = output[0]
        var meta2 = output[1]
        var meta3 = output[2]
        assert.equal(meta1.name, 'node')
        assert.equal(meta2.name, 'edge')
        assert.equal(meta3.name, 'miracle')
        assert.equal(meta1.body, '')
        assert.equal(meta2.body, '(\'<-[ABOUT]-\')')
        assert.equal(meta3.body, '')
        assert.equal(meta1.schemaType, 'TYPE')
        assert.equal(meta2.schemaType, 'PROPERTY')
        assert.equal(meta3.schemaType, 'INPUT')
        assert.equal(meta1.schemaName, 'Brand')
        assert.equal(meta2.schemaName, 'posts: [Post]')
        assert.equal(meta3.schemaName, 'User')
        assert.equal(meta1.parent, null)
        assert.isOk(meta2.parent)
        assert.equal(meta3.parent, null)
        assert.equal(meta2.parent.type, 'TYPE')
        assert.equal(meta2.parent.name, 'Brand')
        assert.isOk(meta2.parent.metadata)
        assert.equal(meta2.parent.metadata.type, 'TYPE')
        assert.equal(meta2.parent.metadata.name, 'node')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getSchemaAST: 01 - BASICS', () => 
      it('Should extract all types and their properties including their respective comments.', () => {
        /*eslint-enable */
        var schema = `
        # This is some description of 
        # what a Post object is.
        type Post {
          id: ID! 
          # A name is a property.
          name: String!
        }

        input PostUserRating {
          # Rating indicates the rating a user gave
          # to a post.
          rating: PostRating!
        }
        `
        var schemaParts = getSchemaAST(schema)
        //console.log(schemaParts);
        assert.isOk(schemaParts, 'schemaParts should exist.')
        assert.equal(schemaParts.length, 2)

        var type1 = schemaParts[0]
        assert.equal(type1.type, 'TYPE')
        assert.equal(type1.name, 'Post')
        assert.equal(type1.genericType, null)
        assert.equal(type1.inherits, null)
        assert.equal(type1.implements, null)
        assert.equal(compressString(type1.comments), compressString('# This is some description of\n# what a Post object is.'))
        assert.isOk(type1.blockProps, 'type1.blockProps should exist.')
        assert.equal(type1.blockProps.length, 2)
        var type1Prop1 = type1.blockProps[0]
        var type1Prop2 = type1.blockProps[1]
        assert.equal(!type1Prop1.comments, true)
        assert.isOk(type1Prop1.details, 'type1Prop1.details should exist.')
        assert.equal(type1Prop1.details.name, 'id')
        assert.equal(type1Prop1.details.params, null)
        assert.isOk(type1Prop1.details.result, 'type1Prop1.details.result should exist.')
        assert.equal(type1Prop1.details.result.originName, 'ID!')
        assert.equal(type1Prop1.details.result.isGen, false)
        assert.equal(type1Prop1.details.result.name, 'ID!')
        assert.equal(compressString(type1Prop2.comments), compressString('# A name is a property.'))
        assert.isOk(type1Prop2.details, 'type1Prop2.details should exist.')
        assert.equal(type1Prop2.details.name, 'name')
        assert.equal(type1Prop2.details.params, null)
        assert.isOk(type1Prop2.details.result, 'type1Prop2.details.result should exist.')
        assert.equal(type1Prop2.details.result.originName, 'String!')
        assert.equal(type1Prop2.details.result.isGen, false)
        assert.equal(type1Prop2.details.result.name, 'String!')

        var type2 = schemaParts[1]
        assert.equal(type2.type, 'INPUT')
        assert.equal(type2.name, 'PostUserRating')
        assert.equal(type2.genericType, null)
        assert.equal(type2.inherits, null)
        assert.equal(type2.implements, null)
        assert.equal(!type2.comments, true)
        assert.isOk(type2.blockProps, 'type2.blockProps should exist.')
        assert.equal(type2.blockProps.length, 1)
        var type2Prop1 = type2.blockProps[0]
        assert.equal(compressString(type2Prop1.comments), compressString('# Rating indicates the rating a user gave\n# to a post.'))
        assert.isOk(type2Prop1.details, 'type2Prop1.details should exist.')
        assert.equal(type2Prop1.details.name, 'rating')
        assert.equal(type2Prop1.details.params, null)
        assert.isOk(type2Prop1.details.result, 'type2Prop1.details.result should exist.')
        assert.equal(type2Prop1.details.result.originName, 'PostRating!')
        assert.equal(type2Prop1.details.result.isGen, false)
        assert.equal(type2Prop1.details.result.name, 'PostRating!')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getSchemaAST: 02 - GENERIC TYPES', () => 
      it('Should create new types for each instance of a generic type.', () => {
        /*eslint-enable */
        var schema = `
        type Paged<T> {
          data: [T]
          cursor: ID
        }
        type Post {
          name
        }
        type User {
          username: String!
          posts: Paged<Post>
        } 
        `
        var schemaParts = getSchemaAST(schema)
        assert.isOk(schemaParts)
        assert.equal(schemaParts.length, 4)
        var genObj = (schemaParts || []).filter(s => s.type == 'TYPE' && s.name == 'PagedPost')[0]
        assert.isOk(genObj, 'The object \'PagedPost\' that should have been auto-generated from Paged<Post> has not been created.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getSchemaAST: 03 - INHERITED METADATA', () => 
      it('Should add properties from the super type to the sub type.', () => {
        /*eslint-enable */
        var schema = `
        @supertype(() => { return 1*2; })
        type PostUserRating inherits Post {
          @brendan((args) => { return 'hello world'; })
          rating: PostRating!
          creationDate: String
        }

        @node
        type Node {
          @primaryKey
          id: ID!
        }

        type Post inherits Node {
          @boris 
          name: String!
        }
        `
        var schemaParts = getSchemaAST(schema)

        assert.isOk(schemaParts)
        assert.equal(schemaParts.length, 3)
        // PostUserRating
        var schemaPart1 = schemaParts[0]
        var typeMeta1 = schemaPart1.metadata
        assert.isOk(typeMeta1)
        assert.equal(typeMeta1.name, 'supertype')
        assert.equal(typeMeta1.body, '(() => { return 1*2; })')
        assert.isOk(schemaPart1.blockProps)
        assert.equal(schemaPart1.blockProps.length, 4)
        var typeMeta1Prop1 = schemaPart1.blockProps[0]
        assert.equal(typeMeta1Prop1.details.name, 'id')
        assert.isOk(typeMeta1Prop1.details.metadata)
        assert.equal(!typeMeta1Prop1.details.metadata.body, true)
        assert.equal(typeMeta1Prop1.details.metadata.name, 'primaryKey')
        var typeMeta1Prop2 = schemaPart1.blockProps[1]
        assert.equal(typeMeta1Prop2.details.name, 'name')
        assert.isOk(typeMeta1Prop2.details.metadata)
        assert.equal(!typeMeta1Prop2.details.metadata.body, true)
        assert.equal(typeMeta1Prop2.details.metadata.name, 'boris')
        var typeMeta1Prop3 = schemaPart1.blockProps[2]
        assert.equal(typeMeta1Prop3.details.name, 'rating')
        assert.isOk(typeMeta1Prop3.details.metadata)
        assert.equal(typeMeta1Prop3.details.metadata.body, '((args) => { return \'hello world\'; })')
        assert.equal(typeMeta1Prop3.details.metadata.name, 'brendan')
        var typeMeta1Prop4 = schemaPart1.blockProps[3]
        assert.equal(typeMeta1Prop4.details.name, 'creationDate')
        assert.isOk(!typeMeta1Prop4.details.metadata)

        // Node
        var schemaPart2 = schemaParts[1]
        var typeMeta2 = schemaPart2.metadata
        assert.isOk(typeMeta2)
        assert.equal(typeMeta2.name, 'node')
        assert.equal(!typeMeta2.body, true)
        assert.isOk(schemaPart2.blockProps)
        assert.equal(schemaPart2.blockProps.length, 1)
        var typeMeta2Prop1 = schemaPart2.blockProps[0]
        assert.equal(typeMeta2Prop1.details.name, 'id')
        assert.isOk(typeMeta2Prop1.details.metadata)
        assert.equal(!typeMeta2Prop1.details.metadata.body, true)
        assert.equal(typeMeta2Prop1.details.metadata.name, 'primaryKey')

        // Post
        var schemaPart3 = schemaParts[2]
        var typeMeta3 = schemaPart3.metadata
        assert.isOk(typeMeta3)
        assert.equal(typeMeta3.name, 'node')
        assert.equal(!typeMeta3.body, true)
        assert.isOk(schemaPart3.blockProps)
        assert.equal(schemaPart3.blockProps.length, 2)
        var typeMeta3Prop1 = schemaPart3.blockProps[0]
        assert.equal(typeMeta3Prop1.details.name, 'id')
        assert.isOk(typeMeta3Prop1.details.metadata)
        assert.equal(!typeMeta3Prop1.details.metadata.body, true)
        assert.equal(typeMeta3Prop1.details.metadata.name, 'primaryKey')
        var typeMeta3Prop2 = schemaPart3.blockProps[1]
        assert.equal(typeMeta3Prop2.details.name, 'name')
        assert.isOk(typeMeta3Prop2.details.metadata)
        assert.equal(!typeMeta3Prop2.details.metadata.body, true)
        assert.equal(typeMeta3Prop2.details.metadata.name, 'boris')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getQueryAST: 01 - GET METADATA', () => 
      it('Should retrieve all metadata associated to the query.', () => {
        /*eslint-enable */

        var schema = `
        type User {
          id: ID!
          username: String!
        }

        type Query {
          @auth
          users: [User]
        }

        input UserInput {
          name: String
          kind: String
        }

        type Mutation {
          @auth
          insert(input: UserInput): User

          @author
          update(input: UserInput): User
        }
        `
        var query = `
        query Hello($person: String, $animal: String) {
          hello:users(where:{name:$person, kind: $animal}){
            id
            username
          }
          users{
            id
          }
        }`

        var mutation = `
        mutation World($person: String, $animal: String) {
          hello:insert(input:{name:$person, kind: $animal}){
            id
            username
          }
          update(input: { name: "fred" }){
            id
          }
        }`

        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query, null, schemaAST)
        var mutationOpAST = getQueryAST(mutation, null, schemaAST)

        var queryAST = queryOpAST.properties
        var mutationAST = mutationOpAST.properties

        assert.equal(queryOpAST.type, 'query', 'Operation type should be \'query\'')
        assert.equal(queryOpAST.name, 'Hello', 'Operation name should be \'Hello\'')
        assert.isOk(queryOpAST.variables, 'Operation variable should exist')
        assert.equal(queryOpAST.variables.length, 2, 'There should be 2 variables for the query operation.')
        assert.equal(queryOpAST.variables[0].name, 'person', 'The 1st query variable should be \'person\'.')
        assert.equal(queryOpAST.variables[0].type, 'String', 'The 1st query variable should be a \'String\' type.')
        assert.equal(queryOpAST.variables[1].name, 'animal', 'The 2nd query variable should be \'animal\'.')
        assert.equal(queryOpAST.variables[1].type, 'String', 'The 2nd query variable should be a \'String\' type.')
        assert.isOk(queryAST, 'An query AST should exist.')
        assert.equal(queryAST.length, 2, 'There should be 2 AST found for the query.')
        assert.equal(queryAST[1].name, 'users','The 2nd AST should be named \'users\'.')
        assert.isOk(queryAST[1].metadata,'metadata should be defined on the \'users\' query.')
        assert.equal(queryAST[1].metadata.name, 'auth','There should be an \'auth\' metadata on the \'users\' query.')
        assert.equal(queryAST[0].name, 'hello:users','The 1st AST should be named \'hello:users\'.')
        assert.isOk(queryAST[0].metadata,'metadata should be defined on the \'users\' query.')
        assert.equal(queryAST[0].metadata.name, 'auth','There should be an \'auth\' metadata on the \'users\' query.')


        assert.equal(mutationOpAST.type, 'mutation', 'Operation type should be \'mutation\'')
        assert.equal(mutationOpAST.name, 'World', 'Operation name should be \'World\'')
        assert.isOk(mutationOpAST.variables, 'Operation variable should exist')
        assert.equal(mutationOpAST.variables.length, 2, 'There should be 2 variables for the mutation operation.')
        assert.equal(mutationOpAST.variables[0].name, 'person', 'The 1st query variable should be \'person\'.')
        assert.equal(mutationOpAST.variables[0].type, 'String', 'The 1st query variable should be a \'String\' type.')
        assert.equal(mutationOpAST.variables[1].name, 'animal', 'The 2nd query variable should be \'animal\'.')
        assert.equal(mutationOpAST.variables[1].type, 'String', 'The 2nd query variable should be a \'String\' type.')
        assert.isOk(mutationAST, 'An mutation AST should exist.')
        assert.equal(mutationAST.length, 2, 'There should be 2 AST found for the mutation.')
        assert.equal(mutationAST[0].name, 'hello:insert','The 1st AST should be named \'hello:insert\'.')
        assert.isOk(mutationAST[0].metadata,'metadata should be defined on the \'users\' mutation.')
        assert.equal(mutationAST[0].metadata.name, 'auth','There should be an \'auth\' metadata on the \'users\' mutation.')
        assert.equal(mutationAST[1].name, 'update','The 2nd AST should be named \'update\'.')
        assert.isOk(mutationAST[1].metadata,'metadata should be defined on the \'users\' mutation.')
        assert.equal(mutationAST[1].metadata.name, 'author','There should be an \'auth\' metadata on the \'users\' mutation.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getQueryAST: 02 - DETECT AST', () => 
      it('Should detect if any query AST match a specific predicate.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          id: ID!
          username: String!
          details: UserDetails
        }

        type UserDetails {
          gender: String 
          bankDetails: BankDetail
        }

        type BankDetail {
          name: String 
          @auth
          account: String
        }

        type Query {
          users: [User]
        }
        `
        var query = `
        query Hello($person: String, $animal: String) {
          hello:users(where:{name:$person, kind: $animal}){
            id
            username
            details {
              gender 
              bankDetails{
                account
              }
            }
          }
          users{
            id
          }
        }`
        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query, null, schemaAST).some(x => x.metadata && x.metadata.name == 'auth')
        assert.isOk(queryOpAST)
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getQueryAST: 03 - FIND ALL AST PATHS', () => 
      it('Should return the details of all the AST property that match a predicate.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          id: ID!
          username: String!
          details: UserDetails
        }

        type Address {
          street: String
        }

        type UserDetails {
          gender: String 
          bankDetails: BankDetail
        }

        type BankDetail {
          name: String 
          @auth
          account: String!
        }

        type Query {
          users: [User]
          @auth
          addresses: [Address]
        }
        `
        var query = `
        query Hello($person: String, $animal: String) {
          hello:users(where:{name:$person, kind: $animal}){
            id
            username
            details {
              gender 
              bankDetails{
                account
              }
            }
          }
          users{
            id
          }
          addresses {
            street
          }
        }`
        var schemaAST = getSchemaAST(schema)
        var paths = getQueryAST(query, null, schemaAST).propertyPaths(x => x.metadata && x.metadata.name == 'auth')
        assert.equal(paths.length, 2, 'There should be 2 fields with the \'auth\' metadata.')
        assert.equal(paths[0].property, 'hello:users.details.bankDetails.account', '1st \'auth\' path does not match.')
        assert.equal(paths[0].type, 'String!')
        assert.equal(paths[1].property, 'addresses', '2nd \'auth\' path does not match.')
        assert.equal(paths[1].type, '[Address]')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#getQueryAST: 04 - BASIC TYPES SUPPORT', () => 
      it('Should support queries with for basic types (id, string, int, boolean, float).', () => {
        /*eslint-enable */
        var schema = `
        type Property {
          inspectionSchedule: InspectionSchedule
        }

        input PagingInput {
          after: ID 
          limit: Int 
        }

        type InspectionSchedule {
          id: ID
          nbrOfVisits: Int
          byAppointment: Boolean
          recurring: Boolean
          description: String 
          price: Float 
        }

        input DirectionalPagingInput inherits PagingInput {
          before: ID 
          direction: SortDirection
        }

        type Query {
          properties(paging: DirectionalPagingInput): [Property]
        }`

      var query_input = `query {
        properties (paging: { limit: 10 }) {
          inspectionSchedule {
            id
            nbrOfVisits
            byAppointment
            recurring
            description
            price
          }
        } 
      }`
        var schemaAST = getSchemaAST(schema)
        var queryOpASTIntrospec = getQueryAST(query_input, null, schemaAST, { defrag: true })

        var query = normalizeString(query_input)
        var queryAnswer = normalizeString(buildQuery(queryOpASTIntrospec))

        assert.equal(queryAnswer, query, 'The rebuild query should match the filtered mock.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 01 - REBUILD QUERY FROM QUERY AST', () => 
      it('Should rebuild the query exactly similar to its original based on the query AST.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          id: ID!
          username: String!
          addesses(where: AddressWhere): [Address]
          kind: String
          gender: Gender
        }

        type Address {
          street: String 
          streetType: StreetType
          postcode: String
          country: Country
        }

        type Country {
          @auth
          id: ID
          name: String
        }

        input AddressWhere {
          postcode: String 
          streetType: [StreetType]
        }

        type Query {
          @auth
          users(where: UserWhere, kind: String, street: [StreetType]): [User]
          addresses: [Address]
        }

        input UserWhere {
          id: ID 
          name: String 
          kind: String
          gender: Gender
        }

        input UserInput {
          name: String
          kind: String
        }

        type Mutation {
          @auth
          insert(input: UserInput): User

          @author
          update(input: UserInput): User
        }

        enum StreetType {
          STREET
          ROAD 
          PLACE
        }

        enum Gender {
          MALE
          FEMALE
        }
        `
        var query_input = `
        query Hello($person: String, $animal: String) {
          hello:users(where:{name:$person, kind: $animal}, kind: $animal){
            id
            username
          }
          users(where: { gender: MALE, id: 1, name: "Nic" }){
            id
            addesses(where: { streetType: [STREET, ROAD] }) {
              street
            }
          }
          test:users(street:[STREET, ROAD]){
            id
          }
          addresses {
            street
            country {
              id
              name
            }
          }
        }`

        var mutation_input = `
        mutation World($person: String, $animal: String) {
          hello:insert(input:{name:$person, kind: $animal}){
            id
            username
          }
          update(input: { name: "fred" }){
            id
          }
        }`
        var schemaAST = getSchemaAST(schema)
        var queryAST = getQueryAST(query_input, null, schemaAST)
        var mutationAST = getQueryAST(mutation_input, null, schemaAST)

        var query = normalizeString(query_input)
        var mutation = normalizeString(mutation_input)

        var queryAnswer = normalizeString(buildQuery(queryAST))
        var mutationAnswer = normalizeString(buildQuery(mutationAST))

        assert.equal(queryAnswer, query, 'The rebuild query should match the original.')
        assert.equal(mutationAnswer, mutation, 'The rebuild mutation should match the original.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 02 - REBUILD QUERY FOR QUERIES WITH VARIABLES WITH ARRAYS', () => 
      it('Should support queries with variables of type array.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          id: ID!
          username: String!
          details: UserDetails
        }

        type Address {
          street: String
        }

        type UserDetails {
          gender: String 
          bankDetails: BankDetail
        }

        type BankDetail {
          name: String 
          @auth
          account: String
        }

        type Query {
          users: [User]
          @auth
          addresses: [Address]
        }
        `
        var query_input = `
        query queryProperties($id: ID, $tags: [String], $before: ID, $limit: Int) {
          properties(where: {id: $id, tags: $tags}, paging: {before: $before, limit: $limit, direction: DESC}) {
            id
            images
            tags
            bathrooms
            carspaces
            bedrooms
            headline
            displayableAddress
            streetNumber
            suburb
            postcode
            state
            __typename
          }
        }`
        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query_input, null, schemaAST)

        var query = normalizeString(query_input)
        var queryAnswer = normalizeString(buildQuery(queryOpAST))

        assert.equal(queryAnswer, query, 'The rebuild query should match the original with variables of type array.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 03 - FILTER QUERY BASED ON METADATA', () => 
      it('Should rebuild a query different from its origin if some fields have been filtered from the orginal query.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          id: ID!
          username: String!
          addesses(where: AddressWhere): [Address]
          kind: String
          gender: Gender
        }

        type Address {
          street: String 
          streetType: StreetType
          postcode: String
          country: Country
        }

        type Country {
          @auth
          id: ID
          name: String
        }

        input AddressWhere {
          postcode: String 
          streetType: [StreetType]
        }

        type Query {
          @auth
          users(where: UserWhere, kind: String, street: [StreetType]): [User]
          addresses: [Address]
        }

        input UserWhere {
          id: ID 
          name: String 
          kind: String
          gender: Gender
        }

        input UserInput {
          name: String
          kind: String
        }

        type Mutation {
          @auth
          insert(input: UserInput): User

          @author
          update(input: UserInput): User
        }

        enum StreetType {
          STREET
          ROAD 
          PLACE
        }

        enum Gender {
          MALE
          FEMALE
        }
        `
        var query_input = `
        query Hello($person: String, $animal: String) {
          hello:users(where:{name:$person, kind: $animal}, kind: $animal){
            id
            username
          }
          users(where: { gender: MALE, id: 1, name: "Nic" }){
            id
            addesses(where: { streetType: [STREET, ROAD] }) {
              street
            }
          }
          test:users(street:[STREET, ROAD]){
            id
          }
          addresses {
            street
            country {
              id
              name
            }
          }
        }`

        var query_filtered = `
        query Hello($person: String, $animal: String) {
          addresses {
            street
            country {
              name
            }
          }
        }`
        var schemaAST = getSchemaAST(schema)
        var queryAST = getQueryAST(query_input, null, schemaAST)

        var filteredQueryAST = queryAST.filter(a => !a.metadata || a.metadata.name != 'auth')
        
        var query = normalizeString(query_filtered)

        var queryAnswer = normalizeString(buildQuery(filteredQueryAST))

        assert.equal(queryAnswer, query, 'The rebuild query should match the filtered mock.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 04 - FRAGMENTS #1', () => 
      it('Should support queries with fragments.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          id: ID!
          username: String!
        }

        type Query {
          @auth
          users: [User]
        }

        input UserInput {
          name: String
          kind: String
        }

        type Mutation {
          @auth
          insert(input: UserInput): User

          @author
          update(input: UserInput): User
        }
        `

        var query_input = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
        }

        fragment FullType on __Type {
          kind
          name
          description
          fields(includeDeprecated: true) {
            name
            description
            args {
              ...InputValue
            }
            type {
              ...TypeRef
            }
            isDeprecated
            deprecationReason
          }
          inputFields {
            ...InputValue
          }
          interfaces {
            ...TypeRef
          }
          enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
          }
          possibleTypes {
            ...TypeRef
          }
        }

        fragment InputValue on __InputValue {
          name
          description
          type { ...TypeRef }
          defaultValue
        }

        fragment TypeRef on __Type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `
        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query_input, null, schemaAST)
        var rebuiltQuery = buildQuery(queryOpAST)

        var query = normalizeString(query_input)
        var queryAnswer = normalizeString(rebuiltQuery)

        assert.equal(queryAnswer, query, 'The rebuild query for the schema request should match the original with fragments.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 05 - FRAGMENTS #2', () => 
      it('Should support merging fragments (DEFRAG).', () => {
        /*eslint-enable */
        var schema = `
        type User {
          @auth
          id: ID!
          @auth
          password: String
          username: String!
        }

        type Query {
          users: [User]
        }

        input UserInput {
          name: String
          kind: String
        }

        type Mutation {
          @auth
          insert(input: UserInput): User

          @author
          update(input: UserInput): User
        }
        `

        var query_input = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
          users{
            ...UserConfidential
            username
          }
        }

        fragment UserConfidential on User {
          id
          password
        }

        fragment FullType on __Type {
          fields(includeDeprecated: true) {
            name
            description
          }
          inputFields {
            ...InputValue
          }
          possibleTypes {
            ...TypeRef
          }
        }

        fragment InputValue on __InputValue {
          name
          type { ...TypeRef }
        }

        fragment TypeRef on __Type {
          kind
          name
        }
        `

        var query_defragged = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              fields(includeDeprecated: true) {
                name
                description
              }
              inputFields {
                name
                type {
                  kind
                  name
                }
              }
              possibleTypes {
                kind
                name
              }
            }
            directives {
              name
              description
              locations
              args {
                name
                type {
                  kind
                  name
                }
              }
            }
          }
          users{
            username
          }
        }
        `
        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query_input, null, schemaAST, { defrag: true })
        var filteredOpAST = queryOpAST.filter(x => !x.metadata || x.metadata.name != 'auth')
        var rebuiltQuery = buildQuery(filteredOpAST)

        var query = normalizeString(query_defragged)
        var queryAnswer = normalizeString(rebuiltQuery)

        assert.equal(queryAnswer, query, 'The rebuild query for the schema request should match the original with fragments.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 06 - FRAGMENTS #2', () => 
      it('Should support queries with multiple queries.', () => {
        /*eslint-enable */
        var schema = `
        type User {
          @auth
          id: ID!
          @auth
          password: String
          username: String!
        }

        type Query {
          users: [User]
        }

        input UserInput {
          name: String
          kind: String
        }

        type Mutation {
          @auth
          insert(input: UserInput): User

          @author
          update(input: UserInput): User
        }
        `

        var query_input = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
          users{
            ...UserConfidential
            username
          }
        }

        query Test {
          users{
            ...UserConfidential
            username
          }
        }

        fragment UserConfidential on User {
          id
          password
        }

        fragment FullType on __Type {
          fields(includeDeprecated: true) {
            name
            description
          }
          inputFields {
            ...InputValue
          }
          possibleTypes {
            ...TypeRef
          }
        }

        fragment InputValue on __InputValue {
          name
          type { ...TypeRef }
        }

        fragment TypeRef on __Type {
          kind
          name
        }
        `

        var query_defragged_introspection = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              fields(includeDeprecated: true) {
                name
                description
              }
              inputFields {
                name
                type {
                  kind
                  name
                }
              }
              possibleTypes {
                kind
                name
              }
            }
            directives {
              name
              description
              locations
              args {
                name
                type {
                  kind
                  name
                }
              }
            }
          }
          users{
            username
          }
        }
        `

        var query_defragged = `
        query Test {
          users{
            username
          }
        }
        `
        var schemaAST = getSchemaAST(schema)
        var queryOpASTIntrospec = getQueryAST(query_input, 'IntrospectionQuery', schemaAST, { defrag: true })
        var filteredOpASTIntrospec = queryOpASTIntrospec.filter(x => !x.metadata || x.metadata.name != 'auth')
        var rebuiltQueryIntrospec = buildQuery(filteredOpASTIntrospec)
        var queryOpASTTest = getQueryAST(query_input, 'Test', schemaAST, { defrag: true })
        var filteredOpASTTest = queryOpASTTest.filter(x => !x.metadata || x.metadata.name != 'auth')
        var rebuiltQueryTest = buildQuery(filteredOpASTTest)

        var query_introspec = normalizeString(query_defragged_introspection)
        var query_test = normalizeString(query_defragged)
        var queryAnswer_introspec = normalizeString(rebuiltQueryIntrospec)
        var queryAnswer_test = normalizeString(rebuiltQueryTest)

        assert.equal(queryAnswer_introspec, query_introspec, 'The rebuild introspec query for the schema request should match the original with fragments.')
        assert.equal(queryAnswer_test, query_test, 'The rebuild test query for the schema request should match the original with fragments.')
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 07 - SUPPORT NON-NULLABLE FIELDS', () => 
      it('Should support queries with multiple queries.', () => {
        /*eslint-enable */
        var schema = `
        type Message {
          message: String
        }

        input CredsInput {
          token: String!
          password: String!
        }

        type Mutation {
          resetPasswordMutation(creds: CredsInput): Message
        }
        `

        var query = `
        mutation resetPasswordMutation($token: String!, $password: String!) {
          userResetPassword(creds: {token: $token, password: $password}) {
            message
            __typename
          }
        }
        `
        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query, null, schemaAST, { defrag: true })
        var rebuiltQuery = buildQuery(queryOpAST)

        assert.equal(normalizeString(rebuiltQuery), normalizeString(query))
      })))

  /*eslint-disable */
  describe('graphqls2s', () => 
    describe('#buildQuery: 08 - SUPPORT INPUT WITH ARRAY VALUES', () => 
      it('Should support input with array values.', () => {
        /*eslint-enable */
        var schema = `
        type Message {
          message: String
        }

        input InputWhere {
          name: String
          locations: [LocationInput]
        }

        input LocationInput {
          type: String 
          value: String
        }

        type Query {
          properties(where: InputWhere): Message
        }
        `

        var query = `
        query{
          properties(where: { name: "Love", locations: [{ type: "house", value: "Bellevue hill" }] }){
            message
          }
        }
        `
        var schemaAST = getSchemaAST(schema)
        var queryOpAST = getQueryAST(query, null, schemaAST, { defrag: true })
        var rebuiltQuery = buildQuery(queryOpAST)

        assert.equal(normalizeString(rebuiltQuery), normalizeString(query))
      })))
} 

/*eslint-disable */
if (browserctxt) runtest(graphqls2s, assert)
  /*eslint-enable */

if (typeof(module) != 'undefined')
  module.exports = {
    runtest
  }
