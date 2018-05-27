// Build a tree from nodes { gbifEntry, node }
// ---------------------------------------
import _clone from 'lodash/clone'
import _mapValues from 'lodash/mapValues'
import _some from 'lodash/some'

function toBranch( node ){
  return {
    lineage: [].concat(node.otNode.lineage).reverse()
    , node: node
    // split:
  }
}

function joinTree( tree, branch ){
  for ( let i = 0, l = tree.lineage.length; i < l; i++ ){
    // check if branch can join the tree's branch
    if ( tree.lineage[ i ].node_id !== branch.lineage[ i ].node_id ){
      // this means we found a branch
      let lineage = tree.lineage.splice( 0, i )
      // shallow clone
      branch = _mapValues( branch, _clone )
      branch.lineage.splice( 0, i )

      let subtree = _clone(tree)
      tree.lineage = lineage
      tree.split = [ subtree, branch ]
      delete tree.node

      return true
    }
  }

  if ( !tree.split ){
    return false
  }

  branch = _mapValues( branch, _clone )
  branch.lineage.splice( 0, tree.lineage.length )

  // if we got here, then we didn't find a place to join in the tree lineage...
  // so let's check the splits
  if ( !_some( tree.split, stem => stem.lineage[0] === branch.lineage[0] ) ){
    // if the first split isn't matched then put it in the current split
    // #edgecases
    tree.split.push( branch )
    return true
  }

  // continue searching...
  for ( let i = 0, l = tree.split.length; i < l; i++ ){
    let stem = tree.split[ i ]
    let joined = joinTree( stem, branch )

    if ( joined === true ){
      // if it was joined in a sub-branch...
      return true
    }
  }

  return false
}

export function buildReducedTree( nodes ){
  var tree = toBranch( nodes[0] )

  for ( let i = 1, l = nodes.length; i < l; i++ ){
    let ret = joinTree( tree, toBranch( nodes[i] ) )
    if ( !ret ){
      // this should never happen. it means it couldn't put a branch in the tree
      throw new Error( 'Could not create cohesive tree from nodes' )
    }
  }

  return tree
}
