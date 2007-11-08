<?xml version="1.0" encoding="ISO-8859-1"?>

<!--
  Section 2.3 of this document explains HTML: http://www.w3.org/TR/xslt 
  xmlns="http://www.w3.org/TR/xhtml1/strict"
  -->

<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html"/>

<xsl:template match="/api">

<h2><b>Chickenfoot API</b></h2>

<table id="api_table" border="0"><tr>

<th>Chickenscratch<br/>Commands</th>
<th>Utility<br/>Commands</th>
<th>Properties</th>
<th>Types</th>

</tr><tr>

<!-- chickenscratch commands -->
<td class="code" rowspan="3">
<xsl:for-each select="command[@type='chickenscratch']">
  <xsl:sort select="@name"/>
  <a>
    <xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:value-of select="@name"/>()</a>
  <br/> 
</xsl:for-each>
</td>

<!-- utility commands -->
<td class="code" rowspan="1">
<xsl:for-each select="command[@type='utility']">
  <xsl:sort select="@name"/>
  <a>
    <xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:value-of select="@name"/>()</a>
  <br/> 
</xsl:for-each>
</td>

<!-- properties -->
<td class="code" rowspan="3">
<xsl:for-each select="property">
  <xsl:sort select="@name"/>
  <a>
    <xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:value-of select="@name"/>
  </a>
  <br/>
</xsl:for-each>
</td>

<!-- types -->
<td class="code" rowspan="1">
<xsl:for-each select="typedef">
  <xsl:sort select="@name"/>
  <a>
    <xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:value-of select="@name"/>
  </a>
  <br/>
</xsl:for-each>
</td>

</tr><tr>

<th>Navigation<br/>Commands</th>
<th>Classes</th>

</tr><tr>

<!-- navigation commands -->
<td class="code">
<xsl:for-each select="command[@type='navigation']">
  <xsl:sort select="@name"/>
  <a>
    <xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:value-of select="@name"/>()</a>
  <br/>
</xsl:for-each>
</td>

<!-- classes -->
<td class="code" rowspan="3">
<xsl:for-each select="class">
  <xsl:sort select="@name"/>
  <a>
    <xsl:attribute name="href">#<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:value-of select="@name"/></a>
  <br/>
</xsl:for-each>
</td>

</tr></table>

<p/>

<div class="section">All Commands</div>

  <dl>
  <xsl:for-each select="command">
  <xsl:sort select="@name"/>
  <dt class="code">
    <a>
      <xsl:attribute name="name"><xsl:value-of select="@name"/></xsl:attribute>
      <b><xsl:value-of select="@name"/></b>
    </a>(<xsl:for-each select="param">
      <xsl:variable name="primitive" select="not (@type='boolean' or @type='string' or @type='number' or @type='object' or @type='regexp')" />
      <xsl:choose>      
        <xsl:when test="$primitive">
        <a>
          <xsl:attribute name="href">#<xsl:value-of select="@type"/></xsl:attribute>
          <xsl:value-of select="@type"/>
        </a>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@type"/>
        </xsl:otherwise>
      </xsl:choose>&#160;<xsl:value-of select="@name"/>
      <xsl:if test="@vararg='true'">...</xsl:if>
      <xsl:if test="not(position()=last())">,&#160;</xsl:if>
    </xsl:for-each>)
    <xsl:if test="return"> :: <xsl:value-of select="return/@type"/></xsl:if>
  </dt>
  <dd>
  <xsl:if test="param">
    <ul>
      <xsl:for-each select="param">
        <li><xsl:value-of select="@name"/>
          <xsl:if test="@optional"><i> (optional)</i></xsl:if>
        </li>          
      </xsl:for-each>
    </ul>
  </xsl:if>
  <p/><xsl:copy-of select="description" />
  <xsl:if test="bug">
    <p/><b>Known bugs:</b>
    <ul>
      <xsl:for-each select="bug">
        <li><xsl:copy-of select="." /></li>
      </xsl:for-each>
    </ul>
  </xsl:if>
  </dd>
  
  <p/><hr/><p/>

  </xsl:for-each>
  </dl>

<div class="section">Properties</div>

  <dl>
  <xsl:for-each select="property">
  <xsl:sort select="@name"/>
    <dt class="code">
    <a>
      <xsl:attribute name="name"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:value-of select="@name"/>
    </a>
    </dt>
    <dd>
    <p/><xsl:copy-of select="description" />
    </dd>
    <p/>
  </xsl:for-each>
  </dl>


<div class="section">Types</div>

<span>
  <xsl:for-each select="typedef">
    <a class="code">
      <xsl:attribute name="name"><xsl:value-of select="@name" /></xsl:attribute>
      <xsl:value-of select="@name"/>
    </a> is a union of the following types:
    <ul>
      <xsl:for-each select="type">
      <!-- hyperlink these -->
      <li><span class="code"><xsl:value-of select="@name" /></span></li>
      </xsl:for-each>
    </ul>
  </xsl:for-each>
</span>

<div class="section">Classes</div>

<span>
  <xsl:for-each select="class">
    <a class="code">
      <xsl:attribute name="name"><xsl:value-of select="@name" /></xsl:attribute>
      <xsl:value-of select="@name"/>
    </a>
    <p/><b>Fields</b><br/>
    <xsl:for-each select="field">
      <span class="code">
        <xsl:value-of select="@type"/>&#160;<xsl:value-of select="@name"/>
      </span><br/>
    </xsl:for-each>
    <p/><b>Methods</b>
    <p/>
  </xsl:for-each>
</span>

</xsl:template>

</xsl:stylesheet>