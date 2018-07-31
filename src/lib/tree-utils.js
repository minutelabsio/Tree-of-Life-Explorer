// Build a tree from leafs
// ---------------------------------------
import _clone from 'lodash/clone'
import _mapValues from 'lodash/mapValues'
import _find from 'lodash/find'
import _sortBy from 'lodash/sortBy'

export function getDepth( tree, max = 0 ){
  if ( !tree.split ){
    return max + 1
  }

  if ( tree.leaf ){
    max += 1
  }

  return tree.split.reduce( (max, tree) => Math.max(max, getDepth(tree, max)), max )
}

function toBranch( leaf ){
  return {
    // starts from the "top" down. (cellular organisms -> ... -> humans)
    lineage: [].concat(leaf.lineage).reverse()
    , nTips: 1
    , leaf: leaf
    , split: []
  }
}

function splitAt( tree, branch, i ){
  branch = _mapValues( branch, _clone )

  // create a cut with a fake leaf that we can fill in later
  mergeAt( tree, toBranch( { node_id: tree.lineage[i].node_id } ), i )

  branch.lineage.splice( 0, i + 1 )

  tree.nTips++
  tree.split.push( branch )
  return 1
}

function mergeAt( tree, branch, i ){
  branch = _mapValues( branch, _clone )

  let lineage = tree.lineage.splice( 0, i )
  let leaf = branch.leaf

  tree.lineage.shift() // this is the same as "leaf"
  branch.lineage = tree.lineage
  branch.split = tree.split
  branch.nTips = tree.nTips
  branch.leaf = tree.leaf

  tree.lineage = lineage
  tree.split = [branch]
  tree.leaf = leaf
  return 0
}

function isInStem( stem, branch ){
  let firstStemId = stem.lineage[0] ? stem.lineage[0].node_id : stem.leaf.node_id
  let firstBranchId = branch.lineage[0] ? branch.lineage[0].node_id : branch.leaf.node_id
  return firstStemId === firstBranchId
}

function joinTree( tree, branch ){

  for ( let i = 0, l = tree.lineage.length; i < l; i++ ){
    let treeParent = tree.lineage[ i ]
    // check if branch can join the tree's branch
    let branchParent = branch.lineage[ i ]
    if ( !branchParent ){

      if ( branch.leaf.node_id === treeParent.node_id ){
        // the branch is in the middle of the current tree branch
        return mergeAt( tree, branch, i )
      } else {
        // this means we found a new branch
        return splitAt( tree, branch, i )
      }
    }
    if ( treeParent.node_id !== branchParent.node_id ){
      // this means we found a new branch
      return splitAt( tree, branch, i - 1 )
    }
  }

  if ( tree.leaf.node_id === branch.leaf.node_id ){
    tree.leaf = branch.leaf
    // edge case when we have already got a split node
    // from previous merges, but also add the branch for it
    return 0
  }

  if (
    branch.lineage.length === tree.lineage.length ||
    ( tree.lineage.length < branch.lineage.length &&
      tree.leaf.node_id !== branch.lineage[tree.lineage.length].node_id )
  ){
    return splitAt( tree, branch, tree.lineage.length - 1 )
  }

  // if ( !tree.split ){
  //   // this means it splits right at the leaf
  //   branch = _mapValues( branch, _clone )
  //   branch.lineage.splice( 0, tree.lineage.length )
  //   tree.nTips++
  //   tree.split = [{ lineage: [], nTips: 1, leaf: tree.leaf }, branch]
  //   delete tree.leaf
  //   return 1
  // }

  branch = _mapValues( branch, _clone )
  branch.lineage.splice( 0, tree.lineage.length + 1 )

  // if we got here, then we didn't find a place to join in the tree lineage...
  // so let's check the splits
  let stem = _find( tree.split, stem => isInStem( stem, branch ) )
  if ( !stem ){
    // if none of the splits match then add to this split
    // #edgecases
    tree.nTips++
    tree.split.push( branch )
    return 1
  }

  let tipsAdded = joinTree( stem, branch )
  tree.nTips += tipsAdded
  return tipsAdded
}

function getNodeId( branch ){
  return branch.leaf ? branch.leaf.node_id : branch.lineage[0].node_id
}

function treeSort( tree ){
  if (!tree.split) { return }
  tree.split.sort( (a, b) => getNodeId(a) > getNodeId(b) )
  tree.split.forEach( treeSort )
}

export function buildReducedTree( leafs ){
  // longest first
  leafs = _sortBy(leafs, n => n.lineage.length).reverse()
  var tree = toBranch( leafs[0] )

  for ( let i = 1, l = leafs.length; i < l; i++ ){
    joinTree( tree, toBranch( leafs[i] ) )
  }

  // assign a depth value to each branch
  let depth = getDepth( tree )
  tree.depth = depth

  // Sorting improves the consistency
  treeSort( tree )

  return tree
}
